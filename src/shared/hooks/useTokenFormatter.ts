import { useRoketoContext } from 'app/roketo-context';
import { TokenFormatter } from 'shared/helpers/formatting';

export function useTokenFormatter(tokenName: string) {
  const { tokens } = useRoketoContext();
  const token = tokens.get(tokenName);

  return TokenFormatter(token.metadata.decimals);
}