import type {Notification, User} from '@roketo/api-client';
import {attach, createEffect, createEvent, createStore, sample} from 'effector';
import {ConnectedWalletAccount, Near, WalletConnection} from 'near-api-js';

import {initFT, RichTokens} from '~/shared/api/ft';
import {createNearInstance, getNearAuth, NearAuth} from '~/shared/api/near';
import {initPriceOracle, PriceOracle} from '~/shared/api/price-oracle';
import {initRoketo, Roketo} from '~/shared/api/roketo';
import {notificationsApiClient, tokenProvider, usersApiClient} from '~/shared/api/roketo-client';
import type {RoketoStream} from '~/shared/api/roketo/interfaces/entities';
import {env} from '~/shared/config';

async function retry<T>(cb: () => Promise<T>) {
  const retryCount = 3;
  let error: unknown;
  for (let i = 0; i <= retryCount; i += 1) {
    try {
      if (i > 0) {
        // eslint-disable-next-line no-await-in-loop
        await tokenProvider.refreshToken();
      }
      // eslint-disable-next-line no-await-in-loop
      return await cb();
    } catch (err: any) {
      if (!err.message.startsWith('HTTP-Code: 401')) throw err;
      error = err;
    }
  }
  throw error;
}

export const initWallets = createEvent();

export const $nearWallet = createStore<null | {near: Near; auth: NearAuth}>(null);
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

export const $isSignedIn = $nearWallet.map((wallet) => wallet?.auth.signedIn ?? false);

export const $accountId = $nearWallet.map((wallet) => wallet?.auth.accountId ?? null);

export const $user = createStore<Partial<User>>({
  name: '',
  email: '',
  isEmailVerified: false,
});

export const $notifications = createStore<Notification[]>([]);

// eslint-disable-next-line arrow-body-style
const getUserFx = createEffect(async (accountId: string) => {
  return retry(() => usersApiClient.findOne(accountId));
});

const KNOWN_NOTIFICATION_TYPES = new Set([
  'StreamStarted',
  'StreamPaused',
  'StreamFinished',
  'StreamIsDue',
  'StreamContinued',
  'StreamCliffPassed',
  'StreamFundsAdded',
]);
// eslint-disable-next-line arrow-body-style
const getNotificationsFx = createEffect(async () => {
  return retry(async () => {
    const allNotifications = await notificationsApiClient.findAll();

    return allNotifications.filter((notification) =>
      KNOWN_NOTIFICATION_TYPES.has(notification.type),
    );
  });
});

export const updateUserFx = attach({
  source: $accountId,
  async effect(
    accountId,
    {name, email, allowNotifications}: {name: string; email: string; allowNotifications: boolean},
  ) {
    if (!accountId) return;
    await usersApiClient.update(accountId, {name, email, allowNotifications});
  },
});

export const lastCreatedStreamUpdated = createEvent<string>();

const createNearWalletFx = createEffect(async () => {
  const near = await createNearInstance();
  const auth = await getNearAuth(new WalletConnection(near, env.ROKETO_CONTRACT_NAME));
  return {near, auth};
});
const createRoketoWalletFx = createEffect(async (account: ConnectedWalletAccount) => {
  const roketo = await initRoketo({account});
  const tokens = await initFT({
    account,
    tokens: roketo.dao.tokens,
  });
  return {roketo, tokens};
});
export const $appLoading = createStore(true);
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
sample({
  clock: $roketoWallet,
  filter: Boolean,
  fn: (wallet) => wallet.roketo.account.last_created_stream,
  target: lastCreatedStreamUpdated,
});
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
  clock: [lastCreatedStreamUpdated, streamsRevalidationTimerFx.doneData],
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

/** when account id is exists, request user info and notifications for it */
sample({
  clock: $accountId,
  filter: Boolean,
  target: [getUserFx, getNotificationsFx],
});

sample({
  clock: [getUserFx.doneData, updateUserFx.done.map(({params}) => params)],
  target: $user,
});
sample({
  clock: getNotificationsFx.doneData,
  target: $notifications,
});

const notificationsUpdateTimerFx = createEffect(
  () =>
    new Promise<void>((rs) => {
      setTimeout(rs, 5000);
    }),
);
sample({
  clock: getNotificationsFx.done,
  target: notificationsUpdateTimerFx,
});
sample({
  clock: notificationsUpdateTimerFx.done,
  target: getNotificationsFx,
});

/** clear user when there is no account id */
sample({
  clock: $accountId,
  filter: (id: string | null): id is null => !id,
  fn: () => ({name: '', email: '', isEmailVerified: false}),
  target: $user,
});
/** clear notifications when there is no account id */
sample({
  clock: $accountId,
  filter: (id: string | null): id is null => !id,
  fn: () => [],
  target: $notifications,
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
sample({
  clock: [createRoketoWalletFx.finally],
  fn: () => false,
  target: $appLoading,
});
