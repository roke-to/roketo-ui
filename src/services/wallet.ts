import {createStore, createEffect, createEvent, sample} from 'effector';
import {ConnectedWalletAccount, Near, WalletConnection} from 'near-api-js';

import {env} from 'shared/config';
import {createNearInstance, getNearAuth, NearAuth} from 'shared/api/near';
import {initRoketo, Roketo} from 'shared/api/roketo';
import type {RoketoStream} from 'shared/api/roketo/interfaces/entities';
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
export const $tokens = createStore<RichTokens>({});
export const $priceOracle = createStore<PriceOracle>({
  getPriceInUsd: () => '0',
});
export const $accountStreams = createStore<{
  inputs: RoketoStream[];
  outputs: RoketoStream[];
  streamsLoaded: boolean;
}>({
  inputs: [],
  outputs: [],
  streamsLoaded: false,
});

export const $isSignedIn = $nearWallet.map(
  (wallet) => wallet?.auth.signedIn ?? false,
);

export const $accountId = $nearWallet.map(
  (wallet) => wallet?.auth.accountId ?? null,
);

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
const requestAccountStreamsFx = createEffect(async (roketo: Roketo) => {
  const [inputs, outputs] = await Promise.all([
    roketo.api.getAccountIncomingStreams({from: 0, limit: 100}),
    roketo.api.getAccountOutgoingStreams({from: 0, limit: 100}),
  ]);
  return {inputs, outputs};
});
const streamsRevalidationTimerFx = createEffect(
  () =>
    new Promise<void>((rs) => {
      setTimeout(rs, 30000);
    }),
);

/**
 * when roketo wallet becomes available or revalidation timer ends
 * start revalidation timer again
 * */
sample({
  clock: [createRoketoWalletFx.doneData, streamsRevalidationTimerFx.doneData],
  target: streamsRevalidationTimerFx,
});
/**
 * when last_created_stream is changed or revalidation timer ends
 * read roketo wallet
 * check whether it exists
 * extract Roketo object from it
 * and start requesting account streams with it
 * */
sample({
  clock: [
    $roketoWallet.map(
      (wallet) => wallet?.roketo.account.last_created_stream ?? null,
    ),
    streamsRevalidationTimerFx.doneData,
  ],
  source: $roketoWallet,
  filter: Boolean,
  fn: (wallet) => wallet.roketo,
  target: requestAccountStreamsFx,
});
/**
 * when account streams successfully requested
 * save them to store $accountStreams
 */
sample({
  clock: requestAccountStreamsFx.doneData,
  fn: ({inputs, outputs}) => ({
    inputs,
    outputs,
    streamsLoaded: true,
  }),
  target: $accountStreams,
});

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
  clock: createRoketoWalletFx.doneData,
  fn: ({tokens}) => tokens,
  target: $tokens,
});
/**
 * when price oracle is initialized allow app to consume it from $priceOracle store
 */
sample({
  clock: createPriceOracleFx.doneData,
  target: $priceOracle,
});
