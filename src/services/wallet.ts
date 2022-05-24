import {createStore, createEffect, createEvent, sample} from 'effector';
import {ConnectedWalletAccount, Near, WalletConnection} from 'near-api-js';

import {env} from 'shared/config';
import {createNearInstance, getNearAuth, NearAuth} from 'shared/api/near';
import {initRoketo, Roketo} from 'shared/api/roketo';
import {initFT, RichTokens} from 'shared/api/ft';
import {initPriceOracle, PriceOracle} from 'shared/api/price-oracle';

export const initWallets = createEvent();

export const $nearWallet = createStore<null | {near: Near; auth: NearAuth}>(
  null,
);
export const $roketoWallet = createStore<null | {
  roketo: Roketo;
  tokens: RichTokens;
}>(null);
export const $priceOracle = createStore<null | PriceOracle>(null);

const createNearWalletFx = createEffect(async () => {
  const near = await createNearInstance();
  const auth = await getNearAuth(
    new WalletConnection(near, env.ROKETO_CONTRACT_NAME),
  );
  return {near, auth};
});
const createRoketoWalletFx = createEffect(
  async (account: ConnectedWalletAccount) => {
    const roketo = await initRoketo({account});
    const tokens = await initFT({
      account,
      tokens: roketo.dao.tokens,
    });
    return {roketo, tokens};
  },
);
const createPriceOracleFx = createEffect((account: ConnectedWalletAccount) =>
  initPriceOracle({account}),
);

sample({
  clock: initWallets,
  target: createNearWalletFx,
});
sample({
  clock: createNearWalletFx.doneData,
  fn: ({auth}) => auth.account,
  target: [createRoketoWalletFx, createPriceOracleFx],
});
sample({
  clock: createNearWalletFx.doneData,
  target: $nearWallet,
});
sample({
  clock: createRoketoWalletFx.doneData,
  target: $roketoWallet,
});
sample({
  clock: createPriceOracleFx.doneData,
  target: $priceOracle,
});
