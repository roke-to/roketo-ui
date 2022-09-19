import {setupWalletSelector} from '@near-wallet-selector/core';
import {setupMyNearWallet} from '@near-wallet-selector/my-near-wallet';
import {setupNearWallet} from '@near-wallet-selector/near-wallet';
import {setupSender} from '@near-wallet-selector/sender';
import type {NearAuth, TransactionMediator} from '@roketo/sdk/dist/types';
import {
  connect,
  ConnectedWalletAccount,
  keyStores,
  Near,
  transactions,
  WalletConnection,
} from 'near-api-js';
import type {Action as NearAction} from 'near-api-js/lib/transaction';

import {env} from '~/shared/config';
import {MAGIC_WALLET_SELECTOR_APP_NAME} from '~/shared/constants';

import {WalletIconType} from './options';

export const createWalletSelectorInstance = async () =>
  setupWalletSelector({
    network: env.NEAR_NETWORK_ID,
    modules: [
      setupNearWallet({
        iconUrl: WalletIconType.NearWallet,
      }),
      setupMyNearWallet({
        iconUrl: WalletIconType.MyNearWallet,
      }),
      setupSender({
        iconUrl: WalletIconType.Sender,
      }),
    ],
  });

export async function createNearInstance(WalletId: string = 'none'): Promise<{
  near: Near;
  auth: NearAuth;
  WalletId: string;
}> {
  const keyStore = new keyStores.BrowserLocalStorageKeyStore();
  let near: Near;

  switch (WalletId) {
    case 'sender':
      near = window.near as unknown as Near;
      break;
    default:
      near = await connect({
        nodeUrl: env.NEAR_NODE_URL,
        walletUrl: env.WALLET_URL,
        networkId: env.NEAR_NETWORK_ID,
        keyStore,
        headers: {},
      });
  }

  const walletConnection = new WalletConnection(near, MAGIC_WALLET_SELECTOR_APP_NAME);

  const accountId = walletConnection.getAccountId();
  const account: ConnectedWalletAccount = walletConnection.account();
  let balance;
  if (accountId) {
    balance = await account.getAccountBalance();
  }

  const nearTransactionMediator: TransactionMediator<NearAction> = {
    functionCall(methodName, args, gas, deposit) {
      return transactions.functionCall(methodName, args, gas, deposit);
    },
    signAndSendTransaction(params) {
      // @ts-expect-error signAndSendTransaction is protected
      return account.signAndSendTransaction(params);
    },
  };
  return {
    WalletId,
    near,
    auth: {
      balance,
      account,
      signedIn: !!accountId,
      accountId,
      async login() {
        localStorage.setItem('profileType', WalletId);
        const appTitle = 'Roketo Token Streaming Service';
        await walletConnection.requestSignIn(env.ROKETO_CONTRACT_NAME, appTitle);
      },
      async logout() {
        localStorage.setItem('profileType', 'none');
        await walletConnection.signOut();
      },
      transactionMediator: nearTransactionMediator,
    },
  };
}
