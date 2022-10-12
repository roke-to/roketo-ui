import {env} from '~/shared/config';

import {TokenProvider} from '../roketo-client';
import {Api as EcoApi} from './generated/eco-api';

export const tokenProvider = new TokenProvider();

export const ecoApi = new EcoApi({
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
      return fetch(input, init);
    }
    return fetchResult;
  },
});

export * from './generated/eco-api';
