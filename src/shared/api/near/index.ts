import {Action, setupWalletSelector, WalletSelector} from '@near-wallet-selector/core';
import {setupMyNearWallet} from '@near-wallet-selector/my-near-wallet';
import {setupNearWallet} from '@near-wallet-selector/near-wallet';
import {setupSender} from '@near-wallet-selector/sender';
import type {NearAuth, TransactionMediator} from '@roketo/sdk/dist/types';
import {connect, ConnectedWalletAccount, keyStores, Near, WalletConnection} from 'near-api-js';

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

export async function createNearInstance(walletSelector: WalletSelector): Promise<{
  near: Near;
  auth: NearAuth;
  WalletId: string;
}> {
  const keyStore = new keyStores.BrowserLocalStorageKeyStore();
  let near: Near;

  const WalletId = walletSelector.store.getState().selectedWalletId;

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

  const nearTransactionMediator: TransactionMediator<Action> = {
    functionCall: (methodName, args, gas, deposit) => ({
      type: 'FunctionCall',
      params: {
        methodName,
        args,
        gas,
        deposit,
      },
    }),
    async signAndSendTransaction(params) {
      const currentWalletId = walletSelector.store.getState().selectedWalletId;

      if (currentWalletId) {
        const wallet = await walletSelector.wallet();

        return wallet.signAndSendTransaction(params);
      }
    },
  };
  return {
    WalletId: WalletId ?? 'none',
    near,
    auth: {
      balance,
      account,
      signedIn: !!accountId,
      accountId,
      async login() {
        const currentWalletId = walletSelector.store.getState().selectedWalletId;

        if (currentWalletId) {
          const wallet = await walletSelector.wallet();

          if (wallet.type !== 'injected') {
            throw new Error('Only injected wallets are supported.');
          }

          return wallet.signIn({contractId: env.ROKETO_CONTRACT_NAME});
        }
      },
      async logout() {
        const currentWalletId = walletSelector.store.getState().selectedWalletId;

        if (currentWalletId) {
          const wallet = await walletSelector.wallet();

          await wallet.signOut();
        }
      },
      transactionMediator: nearTransactionMediator,
    },
  };
}
