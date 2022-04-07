import { Account, Contract, utils, transactions } from 'near-api-js';
import BigNumber from 'bignumber.js';
import JSONbig from 'json-bigint';

import { env, GAS_SIZE } from 'shared/config';

import { TokenMetadata } from './types';

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

  currentUserAccountId: string;

  account: Account;

  constructor(accountId: string, account: Account, tokenAccountId: string) {
    this.currentUserAccountId = accountId;
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
    const res = await this.contract.ft_balance_of({ account_id: this.currentUserAccountId });

    return res;
  }

  async getIsRegistered(): Promise<boolean> {
    const res = await this.contract.storage_balance_of({ account_id: this.currentUserAccountId });

    return res && res.total !== '0';
  }

  async nearDeposit(deposit: string): Promise<void> {
    const res = await this.contract.near_deposit({}, GAS_SIZE, deposit);

    return res;
  }
  
  async storageDeposit(): Promise<void> {
    const res = await this.contract.storage_deposit(
      {},
      GAS_SIZE,
      utils.format.parseNearAmount('0.00125') // account creation costs 0.00125 NEAR for storage
    );
  
    return res;
  }

  transfer = async (payload: any, amount: string, callbackUrl?: string) => {
    const isRegistered = await this.getIsRegistered();

    const actions = [
      transactions.functionCall(
        "near_deposit",
        {},
        '30000000000000',
        // we should add 1 for Push purposes
        new BigNumber(amount).plus('1').toFixed()
      ),
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
      ),
      transactions.functionCall(
        'ft_transfer_call',
        {
          receiver_id: env.ROKETO_CONTRACT_NAME,
          amount: '1',
          memo: 'Roketo transfer',
          msg: '"Push"',
        },
        '100000000000000',
        1
      )
    ];

    if (!isRegistered) {
      actions.unshift(
        transactions.functionCall(
          "storage_deposit",
          {},
          '30000000000000',
          utils.format.parseNearAmount('0.00125') // account creation costs 0.00125 NEAR for storage
        )
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
