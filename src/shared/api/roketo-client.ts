import {WalletConnection} from 'near-api-js';

import {$walletSelector} from '~/entities/wallet/selector';

import {env} from '~/shared/config';
import {MAGIC_WALLET_SELECTOR_APP_NAME} from '~/shared/constants';

import {Api as EcoApi, LoginDto} from './eco/generated/eco-api';
import {createNearInstance} from './near';

export class TokenProvider {
  private initialized: boolean = false;

  private token: null | Promise<string> = null;

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
      const authApiClient = new EcoApi({
        baseUrl: env.WEB_API_URL,
      });

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

      const {accessToken} = await authApiClient.auth.login(loginParams);

      localStorage[key] = accessToken;

      return accessToken;
    } catch (e) {
      // TODO: Think of better handling of failing login.
      this.token = null;

      throw e;
    }
  }

  private async getAccountIdAndNear() {
    const walletSelector = $walletSelector.getState();

    if (!walletSelector) {
      throw new Error('There should be non-null walletSelector at this point.');
    }

    const {near} = await createNearInstance(walletSelector);
    const walletConnection = new WalletConnection(near, MAGIC_WALLET_SELECTOR_APP_NAME);
    const accountId = walletConnection.getAccountId();

    return {accountId, near};
  }

  private async generateLoginParams(): Promise<LoginDto> {
    const {accountId, near} = await this.getAccountIdAndNear();

    const keyPair = await near.config.keyStore.getKey(near.config.networkId, accountId);

    const timestamp = Date.now();

    const {signature: Uint8Signature} = keyPair.sign(new TextEncoder().encode(String(timestamp))); // TODO: Polyfill TextEncoder?

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
