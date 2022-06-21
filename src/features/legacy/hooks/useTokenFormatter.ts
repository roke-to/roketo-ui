import {TokenFormatter} from '~/features/legacy/ft-tokens/token-formatter';

import {useRoketoContext} from '../roketo-context';

export function useTokenFormatter(tokenName: string) {
  const {tokens} = useRoketoContext();
  const token = tokens.get(tokenName);

  return new TokenFormatter(token.metadata.decimals);
}
