import { useRoketoContext } from 'app/roketo-context';

export function useTokenFormatter(tokenAccountId: string) {
  const { tokens } = useRoketoContext();

  return tokens[tokenAccountId];
}
