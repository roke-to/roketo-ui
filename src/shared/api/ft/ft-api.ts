import { Account, Contract } from 'near-api-js';
import BigNumber from 'bignumber.js';

import { TokenMetadata } from './types';

type FTContract = Contract & {
  ft_balance_of: (options: { account_id: string }) => Promise<number>;
  ft_metadata: () => Promise<TokenMetadata>;
  storage_balance_of: (options: { account_id: string }) => Promise<never>;
  ft_transfer_call: ({ args, gas, callbackUrl }: { args: any, gas: number, callbackUrl: string }) => Promise<never>
};

export class FTApi {
  contract: FTContract;

  tokenAccountId: string;

  constructor(account: Account, tokenAccountId: string) {
    this.tokenAccountId = tokenAccountId;

    this.contract = new Contract(account, tokenAccountId, {
      viewMethods: ['ft_balance_of', 'ft_metadata', 'storage_balance_of'],
      changeMethods: ['ft_transfer_call', 'storage_deposit', 'near_deposit'],
    }) as FTContract;

    // @ts-ignore
    // this.contract.storage_deposit({ account_id: 'dcversus3.testnet' }, '200000000000000', '1250000000000000000000' )
    // this.contract.near_deposit({}, '200000000000000', '1250000000000000000000000' )
  }

  async getMetadata(): Promise<TokenMetadata> {
    const res = await this.contract.ft_metadata();

    return res;
  }

  async getBalance(accountId: string): Promise<number> {
    const res = await this.contract.ft_balance_of({ account_id: accountId });

    return res;
  }

  async transfer(request: any, deposit: number, gas: number, callbackUrl: string) {
    let res;

    try {
      res = await this.contract.ft_transfer_call({
        args: {
          receiver_id: this.contract.contractId,
          amount: new BigNumber(deposit).toFixed(),
          memo: 'Roketo transfer',
          msg: JSON.stringify(request),
        },
        gas,
        callbackUrl,
    });

      return res;
    } catch (error) {
      console.debug(error);
      throw error;
    }
  }
}