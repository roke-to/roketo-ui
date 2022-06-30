import {Action as SelectorAction, setupWalletSelector} from '@near-wallet-selector/core';
import {setupSender} from '@near-wallet-selector/sender';
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

import type {NearAuth, TransactionMediator} from '../types';

async function createSenderWalletInstance(): Promise<{
  near: Near;
  auth: NearAuth;
  walletType: 'near' | 'sender';
} | null> {
  if (window.near) {
    const walletSelector = await setupWalletSelector({
      network: env.NEAR_NETWORK_ID,
      modules: [setupSender()],
    });
    const sdrWallet = await walletSelector.wallet('sender');
    console.log('sdrWallet', sdrWallet);
    const senderNear = window.near;
    // @ts-expect-error not typed method
    const accSnd: ConnectedWalletAccount = senderNear.account();
    const accountIdSnd = senderNear.getAccountId();
    let balanceSnd;
    if (accountIdSnd) {
      balanceSnd = await accSnd.getAccountBalance();
    }
    if (accSnd && accSnd.connection.networkId !== env.NEAR_NETWORK_ID) {
      throw Error(
        `wrong account network: ${accSnd.connection.networkId} need ${env.NEAR_NETWORK_ID}`,
      );
    }
    const senderTransactionMediator: TransactionMediator<SelectorAction> = {
      functionCall(methodName, args, gas, deposit) {
        return {type: 'FunctionCall', params: {methodName, args, gas, deposit}};
      },
      signAndSendTransaction({receiverId, actions, walletCallbackUrl}) {
        return sdrWallet.signAndSendTransaction({
          receiverId,
          // @ts-expect-error
          walletCallbackUrl,
          actions,
        });
      },
    };
    return {
      walletType: 'sender',
      auth: {
        balance: balanceSnd,
        account: accSnd,
        signedIn: !!accountIdSnd,
        accountId: accountIdSnd ?? '',
        async login() {
          await sdrWallet.signIn({
            contractId: env.ROKETO_CONTRACT_NAME,
            derivationPaths: [],
            methodNames: ['start_stream', 'pause_stream', 'stop_stream', 'withdraw'],
          });
          localStorage.setItem('profileType', 'sender');
        },
        async logout() {
          localStorage.setItem('profileType', 'none');
          await sdrWallet.signOut();
        },
        transactionMediator: senderTransactionMediator,
      },
      // @ts-expect-error sender near object is not fully typed
      near: senderNear,
    };
  }
  return null;
}

async function createNearWalletInstance(): Promise<{
  near: Near;
  auth: NearAuth;
  walletType: 'near' | 'sender';
}> {
  const keyStore = new keyStores.BrowserLocalStorageKeyStore();
  const near = await connect({
    nodeUrl: env.NEAR_NODE_URL,
    walletUrl: env.WALLET_URL,
    networkId: env.NEAR_NETWORK_ID,
    keyStore,
    headers: {},
  });
  const walletConnection = new WalletConnection(near, env.ROKETO_CONTRACT_NAME);

  const accountId = walletConnection.getAccountId();
  const account = walletConnection.account();
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
    walletType: 'near',
    near,
    auth: {
      balance,
      account,
      signedIn: !!accountId,
      accountId,
      async login() {
        localStorage.setItem('profileType', 'near');
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

export async function createNearInstance(walletType: 'any' | 'near' | 'sender' = 'any') {
  switch (walletType) {
    case 'sender': {
      const result = await createSenderWalletInstance();
      if (!result) throw Error('Sender wallet is not installed');
      localStorage.setItem('profileType', 'sender');
      return result;
    }
    case 'near': {
      localStorage.setItem('profileType', 'near');
      return createNearWalletInstance();
    }
    case 'any':
    default: {
      let profileType = localStorage.getItem('profileType');
      if (!profileType) {
        profileType = 'none';
        localStorage.setItem('profileType', 'none');
      }
      switch (profileType) {
        case 'sender': {
          const senderWallet = await createSenderWalletInstance();
          if (senderWallet) return senderWallet;
          const nearWallet = await createNearWalletInstance();
          localStorage.setItem('profileType', nearWallet.auth.signedIn ? 'near' : 'none');
          return nearWallet;
        }
        case 'near':
          return createNearWalletInstance();
        case 'none':
        default: {
          const nearWallet = await createNearWalletInstance();
          if (nearWallet.auth.signedIn) {
            localStorage.setItem('profileType', 'near');
          }
          return nearWallet;
        }
      }
    }
  }
}
