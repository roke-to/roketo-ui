import {Account} from 'near-api-js';

import {TokenFormatter} from '~/features/legacy/ft-tokens/token-formatter';

import {RoketoDao, RoketoTokenMeta} from '~/shared/api/roketo/interfaces/entities';

import {FTApi} from './ft-api';
import {TokenMetadata} from './types';

export type RichToken = {
  api: FTApi;
  roketoMeta: RoketoTokenMeta;
  formatter: TokenFormatter;
  meta: TokenMetadata;
  balance: string;
};

export type RichTokens = {
  [tokenAccountId: string]: RichToken;
};

type InitFRProps = {
  account: Account;
  tokens: RoketoDao['tokens'];
};

export async function initFT({account, tokens}: InitFRProps) {
  const richTokens: RichTokens = {};

  await Promise.all(
    Object.keys(tokens).map(async (tokenAccountId: string) => {
      const api = new FTApi(account, tokenAccountId);
      const [meta, balance] = await Promise.all([api.getMetadata(), api.getBalance()]);
      const formatter = new TokenFormatter(meta.decimals);

      richTokens[tokenAccountId] = {
        api,
        formatter,
        roketoMeta: tokens[tokenAccountId],
        meta,
        balance,
      };
    }),
  );

  return richTokens;
}
