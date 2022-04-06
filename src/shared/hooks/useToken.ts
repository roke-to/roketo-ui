import { useRoketoContext } from 'app/roketo-context';

export function useToken(tokenAccountId: string) {
  const { tokens } = useRoketoContext();

  // tmp: hard code for wNear
  if (tokenAccountId === 'wrap.testnet') {
    tokens[tokenAccountId].meta.symbol = 'NEAR';
  }

  return tokens[tokenAccountId];
}
