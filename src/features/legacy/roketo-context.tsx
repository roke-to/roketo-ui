import React, { useEffect, useState, useContext } from 'react';
import { Near, WalletConnection } from 'near-api-js';

import { createNearInstance, getNearAuth, NearAuth } from './api/near';
import { initRoketo, Roketo } from './api/roketo';
import { Tokens } from './ft-tokens';
import { env } from '../../shared/config';

type AppServices = {
  auth: NearAuth;
  tokens: Tokens;
  roketo: Roketo;
  near: Near;
  walletConnection: WalletConnection;
};
const AppContext = React.createContext<AppServices | null>(null);

export function RoketoLegacyContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [context, setContext] = useState<AppServices | null>(null);

  useEffect(() => {
    const init = async () => {
      const near = await createNearInstance();

      const walletConnection = new WalletConnection(near, env.ROKETO_CONTRACT_NAME);
      const auth = getNearAuth(walletConnection);

      const roketo = await initRoketo({walletConnection});

      const tokens = new Tokens({
        account: walletConnection.account(),
        tokens: roketo.status.tokens,
      });

      await tokens.init();

      setContext({
        auth,
        near,
        roketo,
        walletConnection,
        tokens,
      });
    };

    init();
  }, []);

  return (
    <AppContext.Provider value={context}>
      {context ? children : null}
    </AppContext.Provider>
  );
}

const ERR_NOT_IN_NEAR_CONTEXT = new Error('Near context is not found');

export function useRoketoContext() {
  const context = useContext(AppContext);

  if (!context) {
    throw ERR_NOT_IN_NEAR_CONTEXT;
  }

  return context;
}
