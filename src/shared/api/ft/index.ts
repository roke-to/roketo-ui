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
  }
}

export async function initFT({ account, tokens }: { account: Account, tokens: RoketoDao['tokens'] }) {
  const richRokens: RichTokens = {};

  // eslint-disable-next-line no-restricted-syntax
  for await (const tokenAccountId of Object.keys(tokens)) {
    const api = new FTApi(account, tokenAccountId);
    const meta = await api.getMetadata();
    const formatter = new TokenFormatter(meta.decimals);

    richRokens[tokenAccountId] = {
      api,
      formatter,
      roketoMeta: tokens[tokenAccountId],
      meta
    };
  }

  return richRokens;
}
