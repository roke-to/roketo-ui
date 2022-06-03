import { connect, keyStores, WalletConnection, ConnectedWalletAccount } from 'near-api-js';

import { env } from '~/shared/config';

export async function createNearInstance() {
  const keyStore = new keyStores.BrowserLocalStorageKeyStore();
  const near = await connect({
    nodeUrl: env.NEAR_NODE_URL,
    walletUrl: env.WALLET_URL,
    networkId: env.NEAR_NETWORK_ID,
    keyStore,
    headers: {},
  });

  return near;
}

export type NearAuth = {
  account: ConnectedWalletAccount;
  signedIn: boolean;
  accountId: string;
  login: () => void,
  logout: () => void,
}

export function getNearAuth(walletConnection: WalletConnection): NearAuth {
  const accountId = walletConnection.getAccountId();
  const account = walletConnection.account();

  async function login() {
    const appTitle = 'Roketo Token Streaming Service';

    await walletConnection.requestSignIn(
      import.meta.env.VITE_ROKETO_LEGACY_CONTRACT_NAME,
      appTitle,
    );
  }

  async function logout() {
    await walletConnection.signOut();

    window.location.reload();
  }

  return {
    account,
    signedIn: !!accountId,
    accountId,
    login,
    logout,
  }
}



