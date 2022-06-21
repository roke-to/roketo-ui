import {Account} from 'near-api-js';
import {SignAndSendTransactionOptions} from 'near-api-js/lib/account';

import {TokenFormatter} from '~/features/legacy/ft-tokens/token-formatter';

import {RoketoDao, RoketoTokenMeta} from '~/shared/api/roketo/interfaces/entities';

import {TokenMetadata} from '../types';
import {FTApi} from './ft-api';

export type RichToken = {
  api: FTApi;
  roketoMeta: RoketoTokenMeta;
  meta: TokenMetadata;
  balance: string;
};

export type RichTokens = {
  [tokenAccountId: string]: RichToken;
};

type InitFRProps = {
  account: Account;
  tokens: RoketoDao['tokens'];
  signAndSendTransaction: (params: SignAndSendTransactionOptions) => Promise<unknown>;
};

export async function initFT({account, tokens, signAndSendTransaction}: InitFRProps) {
  const richTokens: RichTokens = {};

  await Promise.all(
    Object.keys(tokens).map(async (tokenAccountId: string) => {
      const api = new FTApi(account, tokenAccountId, signAndSendTransaction);
      const [meta, balance] = await Promise.all([api.getMetadata(), api.getBalance()]);

      richTokens[tokenAccountId] = {
        api,
        roketoMeta: tokens[tokenAccountId],
        meta,
        balance,
      };
    }),
  );

  return richTokens;
}
