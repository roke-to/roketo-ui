import { useRoketoContext } from 'app/roketo-context';
import { isWNearTokenId } from 'shared/helpers/isWNearTokenId';
import { env } from '../../../shared/config';

export function useToken(tokenAccountId: string) {
  const { tokens } = useRoketoContext();

  if (isWNearTokenId(tokenAccountId)) {
    tokens[tokenAccountId].meta.symbol = 'NEAR';
  }

  return tokens[tokenAccountId === 'NEAR' ? env.WNEAR_ID : tokenAccountId];
}
