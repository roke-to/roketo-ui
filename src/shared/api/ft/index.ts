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
  account: Account;
  tokens: RoketoDao['tokens'];
}

export async function initFT({ account, tokens }: InitFRProps) {
  const richRokens: RichTokens = {};

  await Promise.all(Object.keys(tokens).map(async (tokenAccountId: string) => {
    const api = new FTApi(account, tokenAccountId);
    const [ meta, balance, isRegistered ] = await Promise.all([
      api.getMetadata(),
      api.getBalance(),
      api.getIsRegistered()
    ])
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
