import BigNumber from 'bignumber.js';
import {ConnectedWalletAccount, Contract, providers, transactions, utils} from 'near-api-js';
import {AccessKeyView} from 'near-api-js/lib/providers/provider';
import {Transaction} from 'near-api-js/lib/transaction';

import {env} from '~/shared/config';
import {isWNearTokenId} from '~/shared/lib/isWNearTokenId';

import {FTTransferParams} from '../roketo/interfaces/entities';
import {TokenMetadata} from './types';

type FTContract = Contract & {
  ft_balance_of: (options: {account_id: string}) => Promise<string>;
  storage_balance_of: (options: {
    account_id: string;
  }) => Promise<{total: string; available: string}>;
  ft_metadata: () => Promise<TokenMetadata>;
  near_deposit: (options: {}, gas: string, deposit: string) => Promise<never>;
  storage_deposit: (options: {}, gas: string, deposit: string | null) => Promise<never>;
  ft_transfer_call: ({
    args,
    gas,
    callbackUrl,
    amount,
  }: {
    args: any;
    gas: string;
    callbackUrl: string;
    amount: number;
  }) => Promise<never>;
};

export class FTApi {
  contract: FTContract;

  tokenAccountId: string;

  account: ConnectedWalletAccount;

  constructor(account: ConnectedWalletAccount, tokenAccountId: string) {
    this.tokenAccountId = tokenAccountId;
    this.account = account;

    this.contract = new Contract(account, tokenAccountId, {
      viewMethods: ['ft_balance_of', 'ft_metadata', 'storage_balance_of'],
      changeMethods: ['ft_transfer_call', 'storage_deposit', 'near_deposit'],
    }) as FTContract;
  }

  async getMetadata(): Promise<TokenMetadata> {
    const res = await this.contract.ft_metadata();

    return res;
  }

  async getBalance(): Promise<string> {
    if (!this.account.accountId) {
      return '0';
    }

    const res = await this.contract.ft_balance_of({account_id: this.account.accountId});

    return res;
  }

  async getIsRegistered(accountId: string): Promise<boolean> {
    const res = await this.contract.storage_balance_of({account_id: accountId});

    return res && res.total !== '0';
  }

  addFunds = (amountInYocto: string, streamId: string, callbackUrl: string) => {
    const actions = [
      transactions.functionCall(
        'ft_transfer_call',
        {
          receiver_id: env.ROKETO_CONTRACT_NAME,
          amount: amountInYocto,
          memo: 'Roketo transfer',
          msg: JSON.stringify({
            Deposit: {
              stream_id: streamId,
            },
          }),
        },
        '100000000000000',
        '1',
      ),
    ];
    if (isWNearTokenId(this.tokenAccountId)) {
      actions.unshift(
        transactions.functionCall('near_deposit', {}, '30000000000000', amountInYocto),
      );
    }
    // @ts-expect-error signAndSendTransaction is protected
    this.account.signAndSendTransaction({
      receiverId: this.tokenAccountId,
      walletCallbackUrl: callbackUrl,
      actions,
    });
  };

  transferMany = async (transferParamsArray: FTTransferParams[], callbackUrl?: string) => {
    const allAccountIds = [
      transferParamsArray[0].payload.owner_id,
      ...new Set(transferParamsArray.map(({payload}) => payload.receiver_id)),
    ];

    const areAccountIdsRegistered = await Promise.all(
      allAccountIds.map((accountId) => this.getIsRegistered(accountId)),
    );

    const registeredAccountIdsSet = new Set(
      allAccountIds.filter((accountId, index) => areAccountIdsRegistered[index]),
    );

    const actionsArray = transferParamsArray.map(({payload, amount}) => {
      const actions = [
        transactions.functionCall(
          'ft_transfer_call',
          {
            receiver_id: env.ROKETO_CONTRACT_NAME,
            amount: new BigNumber(amount).toFixed(),
            memo: 'Roketo transfer',
            msg: JSON.stringify({
              Create: {
                request: payload,
              },
            }),
          },
          '100000000000000',
          1,
        ),
      ];

      let depositSum = new BigNumber(0);
      const depositAmount = utils.format.parseNearAmount('0.00125') as string; // account creation costs 0.00125 NEAR for storage

      if (!registeredAccountIdsSet.has(payload.owner_id)) {
        registeredAccountIdsSet.add(payload.owner_id);

        actions.unshift(
          transactions.functionCall(
            'storage_deposit',
            {account_id: payload.owner_id},
            '30000000000000',
            depositAmount,
          ),
        );

        depositSum = depositSum.plus(depositAmount);
      }

      if (!registeredAccountIdsSet.has(payload.receiver_id)) {
        registeredAccountIdsSet.add(payload.receiver_id);

        actions.unshift(
          transactions.functionCall(
            'storage_deposit',
            {account_id: payload.receiver_id},
            '30000000000000',
            depositAmount,
          ),
        );

        depositSum = depositSum.plus(depositAmount);
      }

      if (isWNearTokenId(this.tokenAccountId)) {
        actions.unshift(
          transactions.functionCall(
            'near_deposit',
            {},
            '30000000000000',
            new BigNumber(amount).plus(depositSum).toFixed(),
          ),
        );
      }

      return actions;
    });

    const keyPair = await this.account.walletConnection._keyStore.getKey(
      env.NEAR_NETWORK_ID,
      this.account.accountId,
    );
    const publicKey = keyPair.getPublicKey();

    const accessKey = await new providers.JsonRpcProvider(env.NEAR_NODE_URL).query<AccessKeyView>(
      `access_key/${this.account.accountId}/${publicKey.toString()}`,
      '',
    );

    return this.account.walletConnection.requestSignTransactions({
      transactions: actionsArray.map(
        (actions, index) =>
          new Transaction({
            signerId: this.account.accountId,
            publicKey,
            nonce: accessKey.nonce + index + 1,
            receiverId: this.tokenAccountId,
            actions,
            blockHash: utils.serialize.base_decode(accessKey.block_hash),
          }),
      ),
      callbackUrl,
    });
  };
}
