import {env} from '~/shared/config';

export function isWNearTokenId(tokenAccountId: string) {
  return tokenAccountId === env.WNEAR_ID;
}
