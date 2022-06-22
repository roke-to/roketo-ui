import {useStore} from 'effector-react';

import {$tokens} from '~/entities/wallet';

import {isWNearTokenId} from '~/shared/lib/isWNearTokenId';

export function useToken(tokenAccountId: string) {
  const tokens = useStore($tokens);

  if (isWNearTokenId(tokenAccountId) && tokenAccountId in tokens) {
    tokens[tokenAccountId].meta.symbol = 'NEAR';
  }

  return tokens[tokenAccountId];
}
