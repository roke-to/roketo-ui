import React, {useContext, useEffect, useState} from 'react';
import * as nearAPI from 'near-api-js';
import {NEAR_CONFIG as NearConfig} from './config';
import {RoketoApi} from './RoketoApi';
import {NearContractApi} from './near-contract-api';
import {Croncat} from '../croncat';
import {Tokens} from '../ft-tokens/TokenMeta';

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
    Object.assign({deps: {keyStore}}, NearConfig),
  );
  const _near = NEAR_OBJECT_TYPE;

  _near.keyStore = keyStore;
  _near.near = near;

  _near.walletConnection = new nearAPI.WalletConnection(
    near,
    NearConfig.contractName,
  );
  _near.accountId = _near.walletConnection.getAccountId();
  _near.account = _near.walletConnection.account();

  return _near;
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
      const _near = await createNearInstance();
      const near = _near.near;

      console.debug('Create Near');
      const roketo = new RoketoApi({
        account: _near.account,
        walletConnection: _near.walletConnection,
      });

      console.debug('Create Roketo');
      await roketo.init();

      const croncat = new Croncat({
        wallet: _near.walletConnection,
        operationalCommission: roketo.status.operational_commission,
        contractId: roketo._contract.contractId,
        near: _near.near,
      });
      console.debug('Create Croncat');

      const tokens = new Tokens({
        tokens: roketo.status.tokens,
        account: _near.walletConnection.account(),
      });

      await tokens.init();
      console.debug('Create ft-tokens');
      apiRef.current = roketo;
      croncatRef.current = croncat;
      tokensRef.current = tokens;

      setNear(_near);
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
