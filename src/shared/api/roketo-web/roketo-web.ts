import { useEffect } from 'react';
import useSWR, { SWRResponse } from 'swr';
import type { PublicConfiguration } from 'swr/dist/types';
import * as client from '@roketo/api-client';
import { WalletConnection } from 'near-api-js';

import { useRoketoContext } from 'app/roketo-context';
import { env } from 'shared/config';
import { createNearInstance } from '../near';

const serverConfig = { baseServer: new client.ServerConfiguration(env.WEB_API_URL, {}) };

class TokenProvider {
  private initialized: boolean = false;

  private token: null | Promise<string> = null;

  private readonly authApiClient = new client.AuthApi(client.createConfiguration({ ...serverConfig }));

  getToken() {
    if (!this.token) {
      this.token = this.getRefreshedToken();
    }

    return this.token;
  }

  refreshToken() {
    this.token = this.getRefreshedToken();
  }

  private async getRefreshedToken(): Promise<string> {
    try {
      const { accountId } = await this.getAccountIdAndNear();

      const ROKETO_API_ACCESS_TOKEN_KEY_PREFIX = 'roketoApiAccessToken';

      const key = `${ROKETO_API_ACCESS_TOKEN_KEY_PREFIX}:${accountId}`;

      if (!this.initialized) {
        this.initialized = true;

        const savedToken = localStorage[key] || null;

        if (savedToken && !this.containsUnicode(savedToken)) {
          return savedToken;
        }
      }

      delete localStorage[key];

      const loginParams = await this.generateLoginParams();

      const { accessToken } = await this.authApiClient.login(loginParams);

      localStorage[key] = accessToken;

      return accessToken;
    } catch (e) {
      // TODO: Think of better handling of failing login.
      this.token = null;

      throw e;
    }
  }

  private async getAccountIdAndNear() {
    const near = await createNearInstance();
    const walletConnection = new WalletConnection(near, env.ROKETO_CONTRACT_NAME);
    const accountId = walletConnection.getAccountId();

    return { accountId, near };
  }

  private async generateLoginParams(): Promise<client.LoginDto> {
    const { accountId, near } = await this.getAccountIdAndNear();

    const keyPair = await near.config.keyStore.getKey(near.config.networkId, accountId);

    const timestamp = Date.now();

    const { signature: Uint8Signature } = keyPair.sign(new TextEncoder().encode(String(timestamp))); // TODO: Polyfill TextEncoder?

    const signature: number[] = Array.from(Uint8Signature);

    return {
      accountId,
      timestamp,
      signature,
    }
  }

  private containsUnicode(token: string) {
    return token !== encodeURIComponent(token);
  }
}

const tokenProvider = new TokenProvider();

const onErrorRetry: PublicConfiguration<any, any, any>['onErrorRetry'] = async (error, key, config, revalidate, { retryCount }) => {
  if (error.message.startsWith('HTTP-Code: 401') && retryCount <= 3) {
    await tokenProvider.refreshToken();

    revalidate({ retryCount });
  }
};

const apiConfig = client.createConfiguration({
  ...serverConfig,
  authMethods: { bearer: { tokenProvider } }
});

export const usersApiClient = new client.UsersApi(apiConfig);

export function useUser(): SWRResponse<client.User> {
  const { auth } = useRoketoContext();

  const swr = useSWR(
    auth.accountId ? 'user' : null,
    () => usersApiClient.findOne(auth.accountId),
    { onErrorRetry },
  );

  return swr;
}

export const { User } = client;

export const notificationsApiClient = new client.NotificationsApi(apiConfig);

export function useNotifications(): SWRResponse<client.Notification[]> {
  const { auth } = useRoketoContext();

  const swr = useSWR(
    auth.accountId ? 'notifications' : null,
    () => notificationsApiClient.findAll(),
    { onErrorRetry },
  );

  useEffect(() => {
    setTimeout(swr.mutate, 5000);
  }, [swr]);

  return swr;
}

export type NotificationType = client.NotificationTypeEnum;

export type Notification = client.Notification;
