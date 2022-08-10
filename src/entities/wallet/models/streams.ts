import {attach, createEffect, createEvent, createStore, sample} from 'effector';
import {ConnectedWalletAccount} from 'near-api-js';

import {createRichContracts, getIncomingStreams, getOutgoingStreams} from '~/shared/api/methods';
import {initPriceOracle, PriceOracle} from '~/shared/api/price-oracle';
import {RoketoStream} from '~/shared/api/roketo/interfaces/entities';
import {ApiControl, NearAuth, RichToken} from '~/shared/api/types';
import {upsertWithCache} from '~/shared/lib/changeDetection';

import {
  $account,
  $nearWallet,
  $roketoWallet,
  accountRevalidationTimerFx,
  createNearWalletFx,
  createRoketoWalletFx,
  resetOnLogout,
} from './account';
import {logoutFx} from './session';

const STREAMS_PER_REQUEST = 500;

export const lastCreatedStreamUpdated = createEvent<string>();

export const $tokens = resetOnLogout.createStore<Record<string, RichToken>>({});
export const $listedTokens = resetOnLogout.createStore<Record<string, RichToken>>({});
export const $priceOracle = resetOnLogout.createStore<PriceOracle>({
  getPriceInUsd: () => '0',
});
export const $accountStreams = createStore<{
  inputs: RoketoStream[];
  outputs: RoketoStream[];
  idsCache: Set<string>;
  streamsLoaded: boolean;
}>({
  inputs: [],
  outputs: [],
  idsCache: new Set(),
  streamsLoaded: false,
});
export const $activeStreamsCount = $account.map((account) => ({
  incoming: account?.active_incoming_streams ?? 0,
  outgoing: account?.active_outgoing_streams ?? 0,
}));
export const $allStreams = $accountStreams.map(({inputs, outputs}) => [...inputs, ...outputs]);

export const createPriceOracleFx = createEffect((account: ConnectedWalletAccount) =>
  initPriceOracle({account}),
);
export const requestUnknownTokensFx = createEffect(
  async ({
    tokenNames,
    roketo,
    nearAuth,
  }: {
    tokenNames: string[];
    roketo: ApiControl | null;
    nearAuth: NearAuth | null;
  }) => {
    if (!roketo || !nearAuth || tokenNames.length === 0) return {};
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

export const requestIncomingStreamsFx = attach({
  source: $roketoWallet,
  async effect(wallet, {from, limit}: {from: number; limit: number}) {
    if (wallet) {
      return getIncomingStreams({
        from,
        limit,
        accountId: wallet.accountId,
        contract: wallet.contract,
      });
    }
  },
});
export const requestOutgoingStreamsFx = attach({
  source: $roketoWallet,
  async effect(wallet, {from, limit}: {from: number; limit: number}) {
    if (wallet) {
      return getOutgoingStreams({
        from,
        limit,
        accountId: wallet.accountId,
        contract: wallet.contract,
      });
    }
  },
});
export const requestAccountStreamsFx = attach({
  source: $activeStreamsCount,
  async effect({incoming, outgoing}) {
    const incomingPages = countPages(incoming, STREAMS_PER_REQUEST);
    const outgoingPages = countPages(outgoing, STREAMS_PER_REQUEST);

    await Promise.all([
      ...Array.from({length: incomingPages}, (_, pageIndex) =>
        requestIncomingStreamsFx({
          from: pageIndex * STREAMS_PER_REQUEST,
          limit: STREAMS_PER_REQUEST,
        }),
      ),
      ...Array.from({length: outgoingPages}, (_, pageIndex) =>
        requestOutgoingStreamsFx({
          from: pageIndex * STREAMS_PER_REQUEST,
          limit: STREAMS_PER_REQUEST,
        }),
      ),
    ]);
  },
});

/** When wallet is created or recreated we need to save received tokens */
sample({
  clock: createRoketoWalletFx.doneData,
  fn: ({tokens}) => tokens,
  target: [$tokens, $listedTokens],
});

/** Reset required to delete old streams from local cache */
sample({
  clock: [accountRevalidationTimerFx.done, logoutFx.done],
  fn: () => ({
    inputs: [],
    outputs: [],
    idsCache: new Set<string>(),
    streamsLoaded: false,
  }),
  target: $accountStreams,
});

sample({
  clock: $roketoWallet,
  filter: Boolean,
  fn: (wallet) => wallet.roketoAccount.last_created_stream,
  target: lastCreatedStreamUpdated,
});

/**
 * when last_created_stream is changed or revalidation timer ends
 * read roketo wallet
 * check whether it exists
 * extract Roketo object from it
 * and start requesting account streams with it
 * */
sample({
  clock: [lastCreatedStreamUpdated, accountRevalidationTimerFx.done],
  source: $roketoWallet,
  filter: Boolean,
  target: requestAccountStreamsFx,
});

$accountStreams.on(requestAccountStreamsFx.doneData, (exists) => ({
  ...exists,
  streamsLoaded: true,
}));

$accountStreams.on(requestIncomingStreamsFx.doneData, (exists, incoming) => {
  if (!incoming) return exists;

  return {
    ...exists,
    inputs: upsertWithCache(exists.inputs, incoming, exists.idsCache),
  };
});

$accountStreams.on(requestOutgoingStreamsFx.doneData, (exists, outgoing) => {
  if (!outgoing) return exists;

  return {
    ...exists,
    outputs: upsertWithCache(exists.outputs, outgoing, exists.idsCache),
  };
});

sample({
  clock: $allStreams,
  source: {
    tokens: $tokens,
    roketo: $roketoWallet,
    near: $nearWallet,
  },
  fn({tokens, roketo, near}, allStreams) {
    const streamsTokens = [...new Set(allStreams.map((stream) => stream.token_account_id))];
    const unknownTokens = streamsTokens.filter((token) => !(token in tokens));
    return {
      tokenNames: unknownTokens,
      roketo,
      nearAuth: near?.auth ?? null,
    };
  },
  target: requestUnknownTokensFx,
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
  clock: createNearWalletFx.doneData,
  fn: ({auth}) => auth.account,
  target: createPriceOracleFx,
});

/**
 * when price oracle is initialized allow app to consume it from $priceOracle store
 */
sample({
  clock: createPriceOracleFx.doneData,
  target: $priceOracle,
});

function countPages(total: number, pageSize: number) {
  return Math.ceil(total / pageSize);
}
