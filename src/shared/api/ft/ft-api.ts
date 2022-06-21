import BigNumber from 'bignumber.js';
import {Account, Contract, transactions, utils} from 'near-api-js';
import type {SignAndSendTransactionOptions} from 'near-api-js/lib/account';

import {env} from '~/shared/config';
import {isWNearTokenId} from '~/shared/lib/isWNearTokenId';

import {RoketoCreateRequest} from '../roketo/interfaces/entities';
import type {FTContract, TokenMetadata} from '../types';

export class FTApi {
  contract: FTContract;

  tokenAccountId: string;

  account: Account;

  signAndSendTransaction: (params: SignAndSendTransactionOptions) => Promise<unknown>;

  constructor(
    account: Account,
    tokenAccountId: string,
    signAndSendTransaction: (params: SignAndSendTransactionOptions) => Promise<unknown>,
  ) {
    this.tokenAccountId = tokenAccountId;
    this.account = account;

    this.contract = new Contract(account, tokenAccountId, {
      viewMethods: ['ft_balance_of', 'ft_metadata', 'storage_balance_of'],
      changeMethods: ['ft_transfer_call', 'storage_deposit', 'near_deposit'],
    }) as FTContract;

    this.signAndSendTransaction = signAndSendTransaction;
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
    this.signAndSendTransaction({
      receiverId: this.tokenAccountId,
      walletCallbackUrl: callbackUrl,
      actions,
    });
  };

  transfer = async (payload: RoketoCreateRequest, amount: string, callbackUrl?: string) => {
    const [isRegisteredSender, isRegisteredReceiver] = await Promise.all([
      this.getIsRegistered(payload.owner_id),
      this.getIsRegistered(payload.receiver_id),
    ]);

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

    let depositSumm = new BigNumber(0);
    const depositAmmount = utils.format.parseNearAmount('0.00125') as string; // account creation costs 0.00125 NEAR for storage

    if (!isRegisteredSender) {
      actions.unshift(
        transactions.functionCall(
          'storage_deposit',
          {account_id: payload.owner_id},
          '30000000000000',
          depositAmmount,
        ),
      );

      depositSumm = depositSumm.plus(depositAmmount);
    }

    if (!isRegisteredReceiver) {
      actions.unshift(
        transactions.functionCall(
          'storage_deposit',
          {account_id: payload.receiver_id},
          '30000000000000',
          depositAmmount,
        ),
      );

      depositSumm = depositSumm.plus(depositAmmount);
    }

    if (isWNearTokenId(this.tokenAccountId)) {
      actions.unshift(
        transactions.functionCall(
          'near_deposit',
          {},
          '30000000000000',
          new BigNumber(amount).plus(depositSumm).toFixed(),
        ),
      );
    }

    const res = this.signAndSendTransaction({
      receiverId: this.tokenAccountId,
      walletCallbackUrl: callbackUrl,
      actions,
    });

    return res;
  };
}
