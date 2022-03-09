import React, { useContext, useEffect, useState } from 'react';
import * as nearAPI from 'near-api-js';
import { NEAR_CONFIG as NearConfig } from './config';
import { RoketoApi } from './RoketoApi';
import { NearContractApi } from './near-contract-api';
import { Croncat } from '../croncat';
import { Tokens } from '../ft-tokens';

const NEAR_OBJECT_TYPE = {
  keyStore: null,
  near: null,
  walletConnection: null,
  accountId: null,
  account: null,
};

export const NearContext = React.createContext({
  inited: false,
  near: NEAR_OBJECT_TYPE,
  roketo: new RoketoApi({}),
  croncat: new Croncat({}),
  tokens: new Tokens({}),

  auth: {
    signedIn: false,
    signedAccountId: null,
  },
  contractApi: NearContractApi({}),
  refreshAllowance: () => {},
  login: () => {},
  logout: () => {},
});

async function createNearInstance() {
  const keyStore = new nearAPI.keyStores.BrowserLocalStorageKeyStore();
  const near = await nearAPI.connect(
    { deps: { keyStore }, ...NearConfig },
  );
  const Near = NEAR_OBJECT_TYPE;

  Near.keyStore = keyStore;
  Near.near = near;

  Near.walletConnection = new nearAPI.WalletConnection(
    near,
    NearConfig.contractName,
  );
  Near.accountId = Near.walletConnection.getAccountId();
  Near.account = Near.walletConnection.account();

  return Near;
}

export function useCreateNear() {
  const apiRef = React.useRef(null);
  const croncatRef = React.useRef(null);
  const tokensRef = React.useRef(null);

  const [inited, setInited] = useState(false);
  const [near, setNear] = useState(NEAR_OBJECT_TYPE);

  const auth = {
    signedIn: !!near.accountId,
    signedAccountId: near.accountId,
  };

  async function login() {
    const appTitle = 'Roketo Token Streaming Service';

    await near.walletConnection.requestSignIn(
      NearConfig.contractName,
      appTitle,
    );
  }

  function logout() {
    near.walletConnection.signOut();

    setNear({
      ...near,
      accountId: null,
    });
  }

  async function refreshAllowance() {
    alert(
      "You're out of access key allowance. Need sign in again to refresh it",
    );
    await logout();
    // await requestSignIn();
  }

  useEffect(() => {
    const init = async () => {
      const Near = await createNearInstance();

      console.debug('Create Near');
      const roketo = new RoketoApi({
        account: Near.account,
        walletConnection: Near.walletConnection,
      });

      console.debug('Create Roketo');
      await roketo.init();

      const croncat = new Croncat({
        wallet: Near.walletConnection,
        operationalCommission: roketo.status.operational_commission,
        contractId: roketo._contract.contractId,
        near: Near.near,
      });
      console.debug('Create Croncat');

      const tokens = new Tokens({
        tokens: roketo.status.tokens,
        account: Near.walletConnection.account(),
      });

      await tokens.init();
      console.debug('Create ft-tokens');
      apiRef.current = roketo;
      croncatRef.current = croncat;
      tokensRef.current = tokens;

      setNear(Near);
      setInited(true);
    };

    init();
  }, []);

  return {
    auth,
    near,
    roketo: apiRef.current,
    contractApi: apiRef.current ? apiRef.current.api : null,
    croncat: croncatRef.current,
    tokens: tokensRef.current,
    inited,
    login,
    logout,
    refreshAllowance,
  };
}

const ERR_NOT_IN_NEAR_CONTEXT = new Error('Near context is not found');

export function useNear() {
  const near = useContext(NearContext);
  const insideContext = !!near;

  if (!insideContext) {
    throw ERR_NOT_IN_NEAR_CONTEXT;
  }

  return near;
}
