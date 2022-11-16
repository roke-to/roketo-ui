import {env} from '~/shared/config';

import {TokenProvider} from '../roketo-client';
import {Api as RbApi} from './generated/rb-api';

export const tokenProvider = new TokenProvider();

export const rbApi = new RbApi({
  baseUrl: env.WEB_API_URL,
  securityWorker: async () => ({
    headers: {
      Authorization: `Bearer ${await tokenProvider.getToken()}`,
    },
  }),
  customFetch: async (input: RequestInfo | URL, init?: RequestInit) => {
    const fetchResult = await fetch(input, init);

    if (fetchResult.status === 401) {
      await tokenProvider.refreshToken();

      const headers = {
        Authorization: `Bearer ${await tokenProvider.getToken()}`,
      };

      return fetch(input, {...init, headers});
    }
    return fetchResult;
  },
});

export * from './generated/rb-api';
