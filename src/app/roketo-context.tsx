import React, {useEffect, useState, useContext} from 'react';
import {useStore} from 'effector-react';
import type {Near} from 'near-api-js';

import type {NearAuth} from 'shared/api/near';
import type {Roketo} from 'shared/api/roketo';
import type {RichTokens} from 'shared/api/ft';
import type {PriceOracle} from 'shared/api/price-oracle';
import {
  initWallets,
  $nearWallet,
  $roketoWallet,
  $priceOracle,
} from 'services/wallet';

type AppServices = {
  auth: NearAuth;
  tokens: RichTokens;
  roketo: Roketo;
  priceOracle: PriceOracle;
  near: Near;
};
const AppContext = React.createContext<AppServices | null>(null);

export function RoketoContextProvider({children}: {children: React.ReactNode}) {
  const [context, setContext] = useState<AppServices | null>(null);
  const nearWallet = useStore($nearWallet);
  const roketoWallet = useStore($roketoWallet);
  const priceOracle = useStore($priceOracle);
  useEffect(() => {
    initWallets();
  }, []);
  useEffect(() => {
    if (nearWallet && roketoWallet && priceOracle) {
      const {near, auth} = nearWallet;
      const {roketo, tokens} = roketoWallet;
      setContext({
        auth,
        near,
        roketo,
        priceOracle,
        tokens,
      });
    }
  }, [nearWallet, roketoWallet, priceOracle]);

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
