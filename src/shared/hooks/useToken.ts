import { useRoketoContext } from 'app/roketo-context';

export function useToken(tokenAccountId: string) {
  const { tokens } = useRoketoContext();

  return tokens[tokenAccountId];
}
