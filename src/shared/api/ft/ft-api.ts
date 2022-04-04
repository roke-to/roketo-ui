import { Account, Contract } from 'near-api-js';
import BigNumber from 'bignumber.js';
import JSONbig from 'json-bigint';

import { env, GAS_SIZE } from 'shared/config';

import { TokenMetadata } from './types';

type FTContract = Contract & {
  ft_balance_of: (options: { account_id: string }) => Promise<string>;
  storage_balance_of: (options: { account_id: string }) => Promise<{ total: string, available: string }>;
  ft_metadata: () => Promise<TokenMetadata>;
  near_deposit: (options: { }, gas: string, deposit: string) => Promise<never>;
  storage_deposit: (options: { }, gas: string, deposit: string) => Promise<never>;
  ft_transfer_call: ({ args, gas, callbackUrl, amount }: { args: any, gas: string, callbackUrl: string, amount: number }) => Promise<never>
};

export class FTApi {
  contract: FTContract;

  tokenAccountId: string;

  currentUserAccountId: string;

  constructor(accountId: string, account: Account, tokenAccountId: string) {
    this.currentUserAccountId = accountId;
    this.tokenAccountId = tokenAccountId;

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

    return res.total !== '0';
  }

  async nearDeposit(deposit: string): Promise<void> {
    const res = await this.contract.near_deposit({}, GAS_SIZE, deposit);

    return res;
  }
  
  async storageDeposit(): Promise<void> {
    const res = await this.contract.storage_deposit({}, GAS_SIZE, '1250000000000000000000');
    return res;
  }

  transfer = async (transferPayload: any, totalCost: number, callbackUrl: string) => {
    const res = await this.contract.ft_transfer_call({
      args: {
        receiver_id: env.ROKETO_CONTRACT_NAME,
        amount: new BigNumber(totalCost).toFixed(),
        memo: 'Roketo transfer',
        msg: JSONbig.stringify(transferPayload),
      },
      gas: GAS_SIZE,
      callbackUrl,
      amount: 1,
    });

    return res;
  }
}
