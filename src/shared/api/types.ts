import type {Action as SelectorAction} from '@near-wallet-selector/core';
import type {Account, ConnectedWalletAccount, Contract} from 'near-api-js';
import type {AccountBalance} from 'near-api-js/lib/account';
import type {Action as NearAction} from 'near-api-js/lib/transaction';

import type {RoketoContract} from './roketo/interfaces/contracts';
import type {RoketoAccount, RoketoDao, RoketoTokenMeta} from './roketo/interfaces/entities';

export type TokenMetadata = {
  spec: null;
  name: string;
  symbol: string;
  icon: '';
  reference: null;
  reference_hash: null;
  decimals: number;
};

export type FTContract = Contract & {
  ft_balance_of(options: {account_id: string}): Promise<string>;
  storage_balance_of(options: {account_id: string}): Promise<{total: string; available: string}>;
  ft_metadata(): Promise<TokenMetadata>;
  near_deposit(options: {}, gas: string, deposit: string): Promise<unknown>;
  storage_deposit(options: {}, gas: string, deposit: string | null): Promise<unknown>;
  ft_transfer_call({
    args,
    gas,
    callbackUrl,
    amount,
  }: {
    args: any;
    gas: string;
    callbackUrl: string;
    amount: number;
  }): Promise<unknown>;
};

export type TransactionMediator<
  Act extends NearAction | SelectorAction = NearAction | SelectorAction,
> = {
  functionCall(methodName: string, args: object | Uint8Array, gas: string, deposit: string): Act;
  signAndSendTransaction(params: {
    receiverId: string;
    actions: Act[];
    walletCallbackUrl?: string;
  }): Promise<unknown>;
};

export type NearAuth = {
  balance?: AccountBalance;
  account: ConnectedWalletAccount;
  signedIn: boolean;
  accountId: string;
  login: () => void;
  logout: () => void;
  transactionMediator: TransactionMediator;
};

export type RichToken = {
  roketoMeta: RoketoTokenMeta;
  meta: TokenMetadata;
  balance: string;
  tokenContract: FTContract;
  commission: string;
};

export type ApiControl = {
  account: Account;
  transactionMediator: TransactionMediator;
  accountId: string;
  contract: RoketoContract;
  roketoAccount: RoketoAccount;
  dao: RoketoDao;
  tokens: {[tokenId: string]: RichToken};
};
