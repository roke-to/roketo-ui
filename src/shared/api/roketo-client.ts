import {
  ServerConfiguration,
  AuthApi,
  UsersApi,
  NotificationsApi,
  createConfiguration,
  LoginDto,
} from '@roketo/api-client';
import {WalletConnection} from 'near-api-js';

import {env} from '~/shared/config';
import {createNearInstance} from './near';

const serverConfig = {baseServer: new ServerConfiguration(env.WEB_API_URL, {})};

class TokenProvider {
  private initialized: boolean = false;

  private token: null | Promise<string> = null;

  private readonly authApiClient = new AuthApi(
    createConfiguration({...serverConfig}),
  );

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
      const {accountId} = await this.getAccountIdAndNear();

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

      const {accessToken} = await this.authApiClient.login(loginParams);

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
    const walletConnection = new WalletConnection(
      near,
      env.ROKETO_CONTRACT_NAME,
    );
    const accountId = walletConnection.getAccountId();

    return {accountId, near};
  }

  private async generateLoginParams(): Promise<LoginDto> {
    const {accountId, near} = await this.getAccountIdAndNear();

    const keyPair = await near.config.keyStore.getKey(
      near.config.networkId,
      accountId,
    );

    const timestamp = Date.now();

    const {signature: Uint8Signature} = keyPair.sign(
      new TextEncoder().encode(String(timestamp)),
    ); // TODO: Polyfill TextEncoder?

    const signature: number[] = Array.from(Uint8Signature);

    return {
      accountId,
      timestamp,
      signature,
    };
  }

  private containsUnicode(token: string) {
    return token !== encodeURIComponent(token);
  }
}

export const tokenProvider = new TokenProvider();

const apiConfig = createConfiguration({
  ...serverConfig,
  authMethods: {bearer: {tokenProvider}},
});

export const usersApiClient = new UsersApi(apiConfig);

export const notificationsApiClient = new NotificationsApi(apiConfig);
