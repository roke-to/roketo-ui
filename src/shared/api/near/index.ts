import { connect, keyStores, WalletConnection, ConnectedWalletAccount } from 'near-api-js';

import { NEAR_CONFIG } from './config';

export async function createNearInstance() {
  const keyStore = new keyStores.BrowserLocalStorageKeyStore();
  const near = await connect({
    nodeUrl: NEAR_CONFIG.nodeUrl,
    walletUrl: NEAR_CONFIG.walletUrl,
    networkId: NEAR_CONFIG.networkId,
    keyStore,
    // headers: {},
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
      NEAR_CONFIG.contractName,
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



