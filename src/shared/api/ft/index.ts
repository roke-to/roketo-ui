import { Account } from 'near-api-js';

import { RoketoDao, RoketoTokenMeta } from 'shared/api/roketo/interfaces/entities';

import { TokenMetadata } from './types';
import { TokenFormatter } from './token-formatter';
import { FTApi } from './ft-api';

export type RichTokens = {
  [tokenAccountId: string]: {
    api: FTApi;
    roketoMeta: RoketoTokenMeta;
    formatter: TokenFormatter;
    meta: TokenMetadata;
    balance: string;
    isRegistered: boolean;
  }
}

type InitFRProps = {
  accountId: string;
  account: Account;
  tokens: RoketoDao['tokens'];
}

export async function initFT({ accountId, account, tokens }: InitFRProps) {
  const richRokens: RichTokens = {};

  await Promise.all(Object.keys(tokens).map(async (tokenAccountId: string) => {
    const api = new FTApi(accountId, account, tokenAccountId);
    const meta = await api.getMetadata();
    const balance = await api.getBalance();
    const isRegistered = await api.getIsRegistered();
    const formatter = new TokenFormatter(meta.decimals);

    richRokens[tokenAccountId] = {
      api,
      formatter,
      roketoMeta: tokens[tokenAccountId],
      meta,
      balance,
      isRegistered
    };
  }));

  return richRokens;
}
