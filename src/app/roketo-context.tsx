import React, { useEffect, useState, useContext } from 'react';
import { Near, WalletConnection } from 'near-api-js';

import { env } from 'shared/config';
import { createNearInstance, getNearAuth, NearAuth } from 'shared/api/near';
import { initRoketo, Roketo } from 'shared/api/roketo';
import { initFT, RichTokens } from 'shared/api/ft';

type AppServices = {
  auth: NearAuth;
  tokens: RichTokens;
  roketo: Roketo;
  near: Near;
  walletConnection: WalletConnection;
};
const AppContext = React.createContext<AppServices | null>(null);

export function RoketoContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [context, setContext] = useState<AppServices | null>(null);

  useEffect(() => {
    const init = async () => {
      const near = await createNearInstance();
      const walletConnection = new WalletConnection(near, env.ROKETO_CONTRACT_NAME);
      const auth = await getNearAuth(walletConnection);
      
      if (!auth.signedIn) {
        // @ts-ignore
        setContext({
          near,
          walletConnection,
          auth
        });

        return;
      }

      const roketo = await initRoketo({
        accountId: auth.accountId,
        account: auth.account,
      });

      const tokens = await initFT({
        accountId: auth.accountId,
        account: auth.account,
        tokens: roketo.dao.tokens,
      });

      setContext({
        auth,
        near,
        walletConnection,
        roketo,
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