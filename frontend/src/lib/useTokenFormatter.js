import {useNear} from '../features/near-connect/useNear';
import {TokenFormatter} from './formatting';

export function useTokenFormatter(tokenName) {
  const near = useNear();
  const token = near.tokens.get(tokenName);

  return TokenFormatter(token.metadata.decimals);
}
