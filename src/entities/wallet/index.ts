import type {Notification, UpdateUserDto, User} from '@roketo/api-client';
import {attach, combine, createEffect, createEvent, createStore, sample} from 'effector';
import {ConnectedWalletAccount, Near} from 'near-api-js';

import {
  createRichContracts,
  getAccount,
  getIncomingStreams,
  getOutgoingStreams,
  initApiControl,
} from '~/shared/api/methods';
import {createNearInstance} from '~/shared/api/near';
import {initPriceOracle, PriceOracle} from '~/shared/api/price-oracle';
import {notificationsApiClient, tokenProvider, usersApiClient} from '~/shared/api/roketo-client';
import type {RoketoStream} from '~/shared/api/roketo/interfaces/entities';
import type {ApiControl, NearAuth, RichToken, TransactionMediator} from '~/shared/api/types';
import {getChangedFields} from '~/shared/lib/changeDetection';

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

export const $nearWallet = createStore<null | {
  near: Near;
  auth: NearAuth;
  walletType: 'near' | 'sender';
}>(null);
export const $roketoWallet = createStore<null | ApiControl>(null);
export const $tokens = createStore<Record<string, RichToken>>({});
export const $listedTokens = createStore<Record<string, RichToken>>({});
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

export const $account = $roketoWallet.map((wallet) => wallet?.roketoAccount ?? null);

export const $accountId = $nearWallet.map((wallet) => wallet?.auth.accountId ?? null);

export const $activeStreamsCount = $account.map((account) =>
  account ? account.active_incoming_streams + account.active_outgoing_streams : 0,
);
export const $allStreams = $accountStreams.map(({inputs, outputs}) => [...inputs, ...outputs]);

export const $user = createStore<Partial<User>>({
  name: '',
  email: '',
  isEmailVerified: false,
});

export const $notifications = createStore<Notification[] | null>(null);

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
  source: [$user, $accountId],
  async effect([user, accountId], nextUser: Partial<UpdateUserDto>) {
    if (accountId) {
      const updateUserDto: Partial<UpdateUserDto> = getChangedFields(nextUser, user);

      if (Object.keys(updateUserDto).length !== 0) {
        return usersApiClient.update(accountId, updateUserDto);
      }
    }
  },
});

export const resendVerificationEmailFx = attach({
  source: $accountId,
  async effect(accountId) {
    if (accountId) {
      return usersApiClient.resendVerificationEmail(accountId);
    }
  },
});

export const lastCreatedStreamUpdated = createEvent<string>();

const loginRawFx = attach({
  source: $nearWallet,
  async effect(wallet) {
    await wallet?.auth.login();
  },
});

export const loginFx = attach({
  source: $nearWallet,
  async effect(wallet, walletType: 'near' | 'sender') {
    const currentWalletType = wallet?.walletType ?? null;
    if (currentWalletType && currentWalletType !== walletType) {
      await wallet?.auth.logout();
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      await createNearWalletFx(walletType);
    } else if (!wallet) {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      await createNearWalletFx(walletType);
    }
    await loginRawFx();
  },
});
export const logoutFx = attach({
  source: $nearWallet,
  async effect(wallet) {
    await wallet?.auth.logout();
  },
});

const createNearWalletFx = createEffect(async (walletType: 'near' | 'sender' | 'any' = 'any') => {
  const {near, auth, walletType: type} = await createNearInstance(walletType);
  return {near, auth, walletType: type};
});
const createRoketoWalletFx = createEffect(
  ({
    account,
    transactionMediator,
  }: {
    account: ConnectedWalletAccount;
    transactionMediator: TransactionMediator;
  }) => initApiControl({account, transactionMediator}),
);
const loadAccountFx = attach({
  source: $roketoWallet,
  async effect(wallet) {
    if (wallet) {
      return getAccount(wallet);
    }
  },
});
export const $appLoading = createStore(true);
const createPriceOracleFx = createEffect((account: ConnectedWalletAccount) =>
  initPriceOracle({account}),
);

export const $loadedStreamsCount = $allStreams.map((streams) => streams.length);
export const $leftToLoadStreams = combine(
  $loadedStreamsCount,
  $activeStreamsCount,
  (loaded, active) => Math.max(active - loaded, 0),
);

const requestAccountStreamsFx = attach({
  source: {streams: $accountStreams},
  async effect({streams}, {accountId, contract}: Pick<ApiControl, 'accountId' | 'contract'>) {
    const inputStreamsToLoad = streams.inputs.length === 0 ? 50 : streams.inputs.length;
    const outputStreamsToLoad = streams.outputs.length === 0 ? 50 : streams.outputs.length;
    const [inputs, outputs] = await Promise.all([
      getIncomingStreams({from: 0, limit: inputStreamsToLoad, accountId, contract}),
      getOutgoingStreams({from: 0, limit: outputStreamsToLoad, accountId, contract}),
    ]);
    return {inputs, outputs};
  },
});

const requestUnknownTokensFx = createEffect(
  async ({
    tokenNames,
    roketo,
    nearAuth,
  }: {
    tokenNames: string[];
    roketo: ApiControl | null;
    nearAuth: NearAuth | null;
  }) => {
    if (!roketo || !nearAuth) return {};
    const requestResults = await Promise.all(
      tokenNames.map(async (tokenName) => {
        const [contract] = await roketo.contract.get_token({token_account_id: tokenName});
        return [tokenName, contract] as const;
      }),
    );
    const additionalTokens = await createRichContracts({
      tokensInfo: requestResults,
      account: nearAuth.account,
    });
    return additionalTokens;
  },
);
const streamsRevalidationTimerFx = createEffect(
  () =>
    new Promise<void>((rs) => {
      setTimeout(rs, 30000);
    }),
);
sample({
  clock: $roketoWallet,
  filter: Boolean,
  fn: (wallet) => wallet.roketoAccount.last_created_stream,
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
  target: requestAccountStreamsFx,
});
sample({
  clock: streamsRevalidationTimerFx.doneData,
  target: loadAccountFx,
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
  source: $user,
  fn: (user, nextUser) => ({
    ...user,
    ...nextUser,
    ...(user.email && nextUser.email !== user.email && {isEmailVerified: false}),
  }),
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
  fn: ({auth}) => ({account: auth.account, transactionMediator: auth.transactionMediator}),
  target: [createRoketoWalletFx],
});
sample({
  clock: createNearWalletFx.doneData,
  fn: ({auth}) => auth.account,
  target: [createPriceOracleFx],
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
  clock: loadAccountFx.doneData,
  source: $roketoWallet,
  filter: (wallet, account) => wallet !== null && Boolean(account),
  fn: (wallet, account) => ({
    ...wallet!,
    roketoAccount: account!,
  }),
  target: $roketoWallet,
});
sample({
  clock: createRoketoWalletFx.doneData,
  target: [$tokens, $listedTokens],
  fn: ({tokens}) => tokens,
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

sample({
  clock: $accountStreams,
  source: {
    tokens: $tokens,
    roketo: $roketoWallet,
    near: $nearWallet,
  },
  target: requestUnknownTokensFx,
  fn({tokens, roketo, near}, streams) {
    const allStreams = [...streams.inputs, ...streams.outputs];
    const streamsTokens = [...new Set(allStreams.map((stream) => stream.token_account_id))];
    const unknownTokens = streamsTokens.filter((token) => !(token in tokens));
    return {
      tokenNames: unknownTokens,
      roketo,
      nearAuth: near?.auth ?? null,
    };
  },
});

sample({
  clock: requestUnknownTokensFx.doneData,
  source: $tokens,
  target: $tokens,
  fn(tokens, additionalTokens) {
    if (Object.keys(additionalTokens).length === 0) return tokens;
    return {
      ...tokens,
      ...additionalTokens,
    };
  },
});

sample({
  clock: [loginFx.doneData],
  target: initWallets,
});
$nearWallet.reset([logoutFx.done]);
$roketoWallet.reset([logoutFx.done]);
$user.reset([logoutFx.done]);
$tokens.reset([logoutFx.done]);
$priceOracle.reset([logoutFx.done]);
$accountStreams.reset([logoutFx.done]);
