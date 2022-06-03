import {useStore} from 'effector-react';
import { isWNearTokenId } from '~/shared/lib/isWNearTokenId';
import {$tokens} from '~/entities/wallet';

export function useToken(tokenAccountId: string) {
  const tokens = useStore($tokens);

  if (isWNearTokenId(tokenAccountId)) {
    tokens[tokenAccountId].meta.symbol = 'NEAR';
  }

  return tokens[tokenAccountId];
}
