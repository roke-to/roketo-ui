import { Account, Contract } from 'near-api-js';
import BigNumber from 'bignumber.js';

import { ROKETO_CONTRACT_NAME } from 'shared/api/roketo/config';

import { TokenMetadata } from './types';

const GAS_SIZE = "200000000000000";

type FTContract = Contract & {
  ft_balance_of: (options: { account_id: string }) => Promise<string>;
  ft_metadata: () => Promise<TokenMetadata>;
  // storage_balance_of: (options: { account_id: string }) => Promise<never>;
  near_deposit: (options: { }, gas: string, deposit: string) => Promise<never>;
  ft_transfer_call: ({ args, gas, callbackUrl, amount }: { args: any, gas: number, callbackUrl: string, amount: number }) => Promise<never>
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

    if (tokenAccountId === 'wrap.testnet') {
      // @ts-ignore
      // this.contract.storage_balance_of({ account_id: 'dcversus.testnet' }).then(b => console.log('storage_balance_of', tokenAccountId, b));
      // this.contract.ft_balance_of({ account_id: 'dcversus.testnet' }).then(b => console.log('ft_balance_of', tokenAccountId, b));
      // this.contract.storage_deposit({ account_id: 'dcversus2.testnet' }, '200000000000000', '1250000000000000000000' )
      // this.contract.near_deposit({}, '200000000000000', '1250000000000000000000000')
    }
  }

  async getMetadata(): Promise<TokenMetadata> {
    const res = await this.contract.ft_metadata();

    return res;
  }

  async getBalance(): Promise<string> {
    const res = await this.contract.ft_balance_of({ account_id: this.currentUserAccountId });

    return res;
  }

  async nearDeposit(deposit: string): Promise<number> {
    const res = await this.contract.near_deposit(
      {},
      GAS_SIZE,
      deposit
    );

    return res;
  }

  transfer = async (transferPayload: any, totalCost: number, gas: number, callbackUrl: string) => {
    try {
      const res = await this.contract.ft_transfer_call({
        args: {
          receiver_id: ROKETO_CONTRACT_NAME,
          amount: new BigNumber(totalCost).toFixed(),
          memo: 'Roketo transfer',
          msg: JSON.stringify(transferPayload),
        },
        gas,
        callbackUrl,
        amount: 1,
      });

      return res;
    } catch (error) {
      console.debug(error);
      throw error;
    }
  }
}
