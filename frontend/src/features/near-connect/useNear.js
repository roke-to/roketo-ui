import React, {useContext, useEffect, useState} from 'react';
import * as nearAPI from 'near-api-js';
import {NearContractApi} from './near-contract-api';
import {NEAR_CONFIG as NearConfig} from './config';
import {tokens} from '../../lib/formatting';

export const NearContext = React.createContext({
  inited: false,
  near: {
    keyStore: null,
    near: null,
    walletConnection: null,
    accountId: null,
    contract: null,
    ft: null,
  },
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

  const _near = {
    keyStore: null,
    near: null,
    walletConnection: null,
    accountId: null,
    contract: null,
    ft: null,
  };

  _near.keyStore = keyStore;
  _near.near = near;

  _near.walletConnection = new nearAPI.WalletConnection(
    near,
    NearConfig.contractName,
  );
  _near.accountId = _near.walletConnection.getAccountId();

  _near.account = _near.walletConnection.account();
  _near.contractName = NearConfig.contractName;
  _near.contract = new nearAPI.Contract(
    _near.account,
    NearConfig.contractName,
    {
      viewMethods: ['get_account', 'get_stream', 'get_stream_history'],
      changeMethods: [
        'create_stream',
        'deposit',
        'update_account',
        'start_stream',
        'pause_stream',
        'stop_stream',
        'change_auto_deposit',
        'start_cron',
      ],
    },
  );

  const tokensNames = Object.keys(tokens).filter((item) => item !== 'fallback');
  _near.fts = {};
  for (let i = 0; i < tokensNames.length; i++) {
    _near.fts[tokensNames[i]] = {
      name: tokensNames[i],
      address: tokens[tokensNames[i]].address,
      contract: new nearAPI.Contract(
        _near.account,
        tokens[tokensNames[i]].address,
        {
          viewMethods: ['ft_balance_of'],
          changeMethods: ['ft_transfer', 'ft_transfer_call'],
        },
      ),
    };
  }

  return _near;
}

export function useCreateNear() {
  const apiRef = React.useRef(null);

  const [inited, setInited] = useState(false);
  const [near, setNear] = useState({
    keyStore: null,
    near: null,
    walletConnection: null,
    accountId: null,
    contract: null,
    ft: null,
  });

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

      apiRef.current = NearContractApi(_near);
      setNear(_near);
      setInited(true);
    };

    init();
  }, []);

  return {
    auth,
    near,
    contractApi: apiRef.current,
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
