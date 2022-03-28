// import { useRoketoContext } from 'app/roketo-context';
import { TokenFormatter } from 'shared/helpers/formatting';

export function useTokenFormatter(tokenName: string) {
  // const { tokens } = useRoketoContext();
  // const token = tokens.get(tokenName);
  console.log('tokenName', tokenName)

  return TokenFormatter(10);
}
