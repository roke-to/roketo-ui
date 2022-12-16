import {ModuleState, WalletSelector, WalletSelectorState} from '@near-wallet-selector/core';
import {
  createRichContracts,
  getDao,
  getIncomingStreams,
  getOutgoingStreams,
  initApiControl,
} from '@roketo/sdk';
import type {
  ApiControl,
  NearAuth,
  RichToken,
  RoketoStream,
  TransactionMediator,
} from '@roketo/sdk/dist/types';
import {attach, createEffect, createEvent, createStore, sample} from 'effector';
import {ConnectedWalletAccount, Near} from 'near-api-js';
import {Get} from 'type-fest';

import {ecoApi} from '~/shared/api/eco';
import type {Notification, UpdateUserDto, User} from '~/shared/api/eco/generated/eco-api';
import {createNearInstance, createWalletSelectorInstance} from '~/shared/api/near';
import {initPriceOracle, PriceOracle} from '~/shared/api/price-oracle';
import {env} from '~/shared/config';
import {getChangedFields} from '~/shared/lib/changeDetection';

import {$walletSelector} from './selector';

export const initWallets = createEvent();

export const $nearWallet = createStore<null | {
  near: Near;
  auth: NearAuth;
  WalletId: string;
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

export const $user = createStore<Partial<User>>({
  name: '',
  email: '',
  isEmailVerified: false,
});

export const $notifications = createStore<Notification[] | null>(null);

export const $fts = createStore<string[] | null>(null);
export const $nfts = createStore<string[] | null>(null);

export const $archivedStreams = createStore<{
  streams: RoketoStream[];
  streamsLoaded: boolean;
}>({
  streams: [],
  streamsLoaded: false,
});

export const $streamsToNft = createStore<{
  streams: RoketoStream[];
  streamsLoaded: boolean;
}>({
  streams: [],
  streamsLoaded: false,
});

// eslint-disable-next-line arrow-body-style
const getUserFx = createEffect(async (accountId: string) => {
  return ecoApi.users.findOne(accountId);
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
  const allNotifications = await ecoApi.notifications.findAllNotifications();

  return allNotifications.filter((notification: Notification) =>
    KNOWN_NOTIFICATION_TYPES.has(notification.type),
  );
});

const getArchivedStreamsFx = createEffect(async () => {
  const allStreams = await ecoApi.archivedStreams.findArchivedStreams();
  return allStreams.map((stream) => stream.payload.stream);
});

const getStreamsToNFTFx = createEffect(async (accountId: string) => {
  console.log(accountId);
  return ecoApi.tokens.findAllNftTransactions(accountId);
});

export const updateUserFx = attach({
  source: [$user, $accountId],
  async effect([user, accountId], nextUser: Partial<UpdateUserDto>) {
    if (accountId) {
      const updateUserDto: Partial<UpdateUserDto> = getChangedFields(nextUser, user);

      if (Object.keys(updateUserDto).length !== 0) {
        return ecoApi.users.update(accountId, updateUserDto);
      }
    }
  },
});

const getUserFTsFx = createEffect(async (accountId: string) =>
  ecoApi.tokens.findAllTokens(accountId),
);

const getUserNFTsFx = createEffect(async (accountId: string) =>
  ecoApi.tokens.findAllNfTs(accountId),
);

export const resendVerificationEmailFx = attach({
  source: $accountId,
  async effect(accountId) {
    if (accountId) {
      return ecoApi.users.resendVerificationEmail(accountId);
    }
  },
});

export const lastCreatedStreamUpdated = createEvent<string>();

export const $walletSelectorState = createStore<WalletSelectorState>({
  contract: null,
  modules: [],
  accounts: [],
  selectedWalletId: null,
});

// Login logic
export const walletClicked = createEvent<ModuleState>();

export const loginViaWalletFx = createEffect(async (module: ModuleState) => {
  try {
    const wallet = await module.wallet();

    // dont support hardware wallet
    if (wallet.type === 'hardware') {
      return;
    }

    await wallet.signIn({
      contractId: env.ROKETO_CONTRACT_NAME,
    });
  } catch (err) {
    const {name} = module.metadata;

    const message = err instanceof Error ? err.message : 'Something went wrong';

    const error = new Error(`Failed to sign in with ${name}: ${message}`) as Error & {
      originalError: unknown;
    };

    error.originalError = err;

    throw error;
  }
});

const setWalletSelectorState = createEvent<WalletSelectorState>();

let walletSelectorStoreSubscription: ReturnType<Get<WalletSelector, 'store.observable.subscribe'>>;

const createWalletSelectorInstanceFx = createEffect(async () => {
  const walletSelector = await createWalletSelectorInstance();

  if (!walletSelectorStoreSubscription) {
    walletSelectorStoreSubscription = walletSelector.store.observable.subscribe((state) => {
      setWalletSelectorState(state);
    });
  }

  return walletSelector;
});

export const logoutFx = attach({
  source: $walletSelector,
  async effect(walletSelector) {
    const wallet = await walletSelector?.wallet();
    await wallet?.signOut();
  },
});

const createNearWalletFx = createEffect(async (walletSelector: WalletSelector | null) => {
  if (!walletSelector) {
    throw new Error('There should be non-null walletSelector at this point.');
  }

  const {near, auth, WalletId: type} = await createNearInstance(walletSelector);
  return {near, auth, WalletId: type};
});
const createRoketoWalletFx = createEffect(
  ({
    account,
    transactionMediator,
  }: {
    account: ConnectedWalletAccount;
    transactionMediator: TransactionMediator;
  }) =>
    initApiControl({account, transactionMediator, roketoContractName: env.ROKETO_CONTRACT_NAME}),
);
export const $appLoading = createStore(true);
const createPriceOracleFx = createEffect((account: ConnectedWalletAccount) =>
  initPriceOracle({account}),
);
const requestAccountStreamsFx = createEffect(
  async ({accountId, contract}: Pick<ApiControl, 'accountId' | 'contract'>) => {
    const [inputs, outputs] = await Promise.all([
      getIncomingStreams({from: 0, limit: 500, accountId, contract}),
      getOutgoingStreams({from: 0, limit: 500, accountId, contract}),
    ]);
    return {inputs, outputs};
  },
);

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

    const {contract} = roketo;
    const [dao] = await Promise.all([getDao({contract})]);

    const additionalTokens = await createRichContracts({
      account: nearAuth.account,
      tokensInfo: requestResults,
      dao,
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
  fn: ({accountId, contract}) => ({accountId, contract}),
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
  target: [
    getUserFx,
    getNotificationsFx,
    getArchivedStreamsFx,
    getStreamsToNFTFx,
    getUserFTsFx,
    getUserNFTsFx,
  ],
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

sample({
  clock: getUserFTsFx.doneData,
  target: $fts,
});

sample({
  clock: getUserNFTsFx.doneData,
  target: $nfts,
});

sample({
  clock: getArchivedStreamsFx.doneData,
  fn: (streams) => ({
    streams,
    streamsLoaded: true,
  }),
  target: $archivedStreams,
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

const archivedStreamsUpdateTimerFx = createEffect(
  () =>
    new Promise<void>((rs) => {
      setTimeout(rs, 5000);
    }),
);
sample({
  clock: getArchivedStreamsFx.done,
  target: archivedStreamsUpdateTimerFx,
});
sample({
  clock: archivedStreamsUpdateTimerFx.done,
  target: getArchivedStreamsFx,
});

const streamsToNFTUpdateTimerFx = createEffect(
  () =>
    new Promise<void>((rs) => {
      setTimeout(rs, 5000);
    }),
);

sample({
  clock: getStreamsToNFTFx.done,
  target: streamsToNFTUpdateTimerFx,
});

sample({
  clock: streamsToNFTUpdateTimerFx.done,
  fn: ({params}: {params: any}) => params.params,
  target: getStreamsToNFTFx,
});

sample({
  clock: getStreamsToNFTFx.doneData,
  fn: (streams) => ({
    streams,
    streamsLoaded: true,
  }),
  target: $streamsToNft,
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
// Choose some wallet and click it
sample({
  clock: walletClicked,
  target: loginViaWalletFx,
});

sample({
  clock: initWallets,
  target: createWalletSelectorInstanceFx,
});

sample({
  clock: createWalletSelectorInstanceFx.doneData,
  target: $walletSelector,
});

// Update state when it changed
sample({
  clock: setWalletSelectorState,
  target: $walletSelectorState,
});

sample({
  clock: $walletSelector,
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
  clock: $fts,
  source: {
    roketo: $roketoWallet,
    near: $nearWallet,
  },
  target: requestUnknownTokensFx,
  fn({roketo, near}, tokenNames) {
    return {
      tokenNames: tokenNames ?? [],
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

$nearWallet.reset([logoutFx.done]);
$roketoWallet.reset([logoutFx.done]);
$user.reset([logoutFx.done]);
$tokens.reset([logoutFx.done]);
$priceOracle.reset([logoutFx.done]);
$accountStreams.reset([logoutFx.done]);
