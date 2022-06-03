import { Account, Contract, utils, transactions } from 'near-api-js';
import BigNumber from 'bignumber.js';
import JSONbig from 'json-bigint';

import { isWNearTokenId } from '~/shared/helpers/isWNearTokenId';
import { env } from '~/shared/config';

import { TokenMetadata } from './types';
import { RoketoCreateRequest } from '../roketo/interfaces/entities';

type FTContract = Contract & {
  ft_balance_of: (options: { account_id: string }) => Promise<string>;
  storage_balance_of: (options: { account_id: string }) => Promise<{ total: string, available: string }>;
  ft_metadata: () => Promise<TokenMetadata>;
  near_deposit: (options: { }, gas: string, deposit: string) => Promise<never>;
  storage_deposit: (options: { }, gas: string, deposit: string | null) => Promise<never>;
  ft_transfer_call: ({ args, gas, callbackUrl, amount }: { args: any, gas: string, callbackUrl: string, amount: number }) => Promise<never>
};

export class FTApi {
  contract: FTContract;

  tokenAccountId: string;

  account: Account;

  constructor(account: Account, tokenAccountId: string) {
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

    const res = await this.contract.ft_balance_of({ account_id: this.account.accountId });

    return res;
  }

  async getIsRegistered(accountId: string): Promise<boolean> {
    const res = await this.contract.storage_balance_of({ account_id: accountId });

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
            }
          }),
        },
        '100000000000000',
        '1',
      )
    ]
    if (isWNearTokenId(this.tokenAccountId)) {
      actions.unshift(
        transactions.functionCall(
          "near_deposit",
          {},
          '30000000000000',
          amountInYocto,
        )
      )
    }
    // @ts-expect-error signAndSendTransaction is protected
    return this.account.signAndSendTransaction({
      receiverId: this.tokenAccountId,
      walletCallbackUrl: callbackUrl,
      actions
    })
  }

  transfer = async (payload: RoketoCreateRequest, amount: string, callbackUrl?: string) => {
    const [ isRegisteredSender, isRegisteredReceiver ] = await Promise.all([
      this.getIsRegistered(payload.owner_id),
      this.getIsRegistered(payload.receiver_id)
    ]);

    const actions = [
      transactions.functionCall(
        'ft_transfer_call',
        {
          receiver_id: env.ROKETO_CONTRACT_NAME,
          amount: new BigNumber(amount).toFixed(),
          memo: 'Roketo transfer',
          msg: JSONbig.stringify({
            Create: {
              request: payload
            }
          }),
        },
        '100000000000000',
        1
      )
    ];

    let depositSumm = new BigNumber(0);
    const depositAmmount =  utils.format.parseNearAmount('0.00125') as string; // account creation costs 0.00125 NEAR for storage

    if (!isRegisteredSender) {
      actions.unshift(
        transactions.functionCall(
          "storage_deposit",
          { account_id: payload.owner_id },
          '30000000000000',
          depositAmmount
        )
      )

      depositSumm = depositSumm.plus(depositAmmount);
    }

    if (!isRegisteredReceiver) {
      actions.unshift(
        transactions.functionCall(
          "storage_deposit",
          { account_id: payload.receiver_id },
          '30000000000000',
          depositAmmount
        )
      )

      depositSumm = depositSumm.plus(depositAmmount);
    }

    if(isWNearTokenId(this.tokenAccountId)) {
      actions.unshift(
        transactions.functionCall(
          "near_deposit",
          {},
          '30000000000000',
          new BigNumber(amount).plus(depositSumm).toFixed()
        ),
      )
    }

    // @ts-ignore
    const res = this.account.signAndSendTransaction({
      receiverId: this.tokenAccountId,
      walletCallbackUrl: callbackUrl,
      actions
    });

    return res;
  }
}
