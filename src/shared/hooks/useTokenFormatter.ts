import { useRoketoContext } from 'app/roketo-context';
import { TokenFormatter } from 'shared/helpers/formatting';

export function useTokenFormatter(tokenAccountId: string) {
  const { tokens } = useRoketoContext();
  const currentToken = tokens[tokenAccountId];

  return TokenFormatter(currentToken.meta.decimals);
}
