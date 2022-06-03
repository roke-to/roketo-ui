import {createStore, sample, attach, combine, createEffect} from 'effector';
import {createGate} from 'effector-react';

import type {RoketoStream} from '~/shared/api/roketo/interfaces/entities';
import {$roketoWallet, lastCreatedStreamUpdated} from '~/services/wallet';

export const pageGate = createGate<string | null>({defaultState: null});
export const $stream = createStore<RoketoStream | null>(null);
export const $pageError = createStore<string | null>(null);
const requestStreamFx = attach({
  source: $roketoWallet,
  async effect(wallet, streamId: string | null) {
    return streamId && wallet?.roketo.api.getStream({streamId});
  },
});
export const $loading = combine(
  $stream,
  $pageError,
  (stream, error) => !stream && !error,
);

const streamRevalidationTimerFx = createEffect(
  () =>
    new Promise<void>((rs) => {
      setTimeout(rs, 10000);
    }),
);
/**
 * when last_created_stream is changed, revalidation timer ends or stream id in page URL changed
 * read page stream id
 * check whether page is open
 * and start requesting stream data
 * */
sample({
  clock: [
    lastCreatedStreamUpdated,
    pageGate.state,
    streamRevalidationTimerFx.doneData,
  ],
  source: pageGate.state,
  filter: pageGate.status,
  target: requestStreamFx,
});
/**
 * when page is opened or revalidation timer ends
 * start revalidation timer again
 * */
sample({
  clock: [pageGate.open, streamRevalidationTimerFx.doneData],
  filter: pageGate.status,
  target: streamRevalidationTimerFx,
});
sample({
  clock: requestStreamFx.doneData,
  filter: Boolean,
  target: $stream,
});
/** clear stream data when page is closed */
sample({
  clock: pageGate.close,
  fn: () => null,
  target: $stream,
});
sample({
  clock: requestStreamFx.failData,
  fn: (error) => error.message,
  target: $pageError,
});
/** clear error message when stream successfully requested */
sample({
  clock: requestStreamFx.doneData,
  fn: () => null,
  target: $pageError,
});
