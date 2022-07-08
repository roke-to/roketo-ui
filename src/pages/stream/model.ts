import {isPast} from 'date-fns';
import {combine, createEffect, createEvent, createStore, sample, split} from 'effector';
import {createGate} from 'effector-react';

import {getStreamingSpeed} from '~/features/create-stream/lib';
import {formatTimeLeft, streamViewData} from '~/features/roketo-resource';

import {
  $accountId,
  $priceOracle,
  $roketoWallet,
  $tokens,
  lastCreatedStreamUpdated,
} from '~/entities/wallet';

import {getStream} from '~/shared/api/methods';
import {STREAM_DIRECTION, STREAM_STATUS, StreamDirection} from '~/shared/api/roketo/constants';
import type {RoketoStream} from '~/shared/api/roketo/interfaces/entities';
import {
  getAvailableToWithdraw,
  getStreamDirection,
  hasPassedCliff,
  isDead,
  isIdling,
  isLocked,
} from '~/shared/api/roketo/lib';
import {formatAmount, formatSmartly, toHumanReadableValue} from '~/shared/api/token-formatter';
import type {RichToken} from '~/shared/api/types';
import {createProtectedEffect} from '~/shared/lib/protectedEffect';
import {getStreamLink} from '~/shared/lib/routing';

export const pageGate = createGate<string | null>({defaultState: null});
export const $stream = createStore<RoketoStream | null>(null);
export const $pageError = createStore<string | null>(null);
const requestStreamFx = createProtectedEffect({
  source: $roketoWallet,
  async fn({contract}, streamId: string | null) {
    return streamId && getStream({streamId, contract});
  },
});
export const $loading = combine($stream, $pageError, (stream, error) => !stream && !error);

const dataUpdated = createEvent<{
  stream: RoketoStream;
  token: RichToken;
}>();
const drawRetriggered = createEvent<{
  stream: RoketoStream;
  token: RichToken;
}>();
const noData = createEvent<unknown>();

export const $link = createStore<string | null>(null);

export const $streamInfo = createStore({
  active: false,
  sender: '',
  receiver: '',
  amount: '',
  tokenSymbol: '',
  cliff: null as null | {title: string; value: string},
  remaining: '',
  tokensAvailable: '',
  progressText: '',
  progressInUSD: '',
  withdrawnText: '',
  cliffPercent: null as number | null,
  withdrawn: '',
  streamed: '',
  total: '',
  isLocked: false,
  speed: null as string | null,
  comment: null as string | null,
  color: null as string | null,
  showControls: false,
  showAddFundsButton: false,
  showWithdrawButton: false,
  subheader: '',
  direction: null as StreamDirection | null,
});

const progressRedrawTimerFx = createEffect(
  () =>
    new Promise<void>((rs) => {
      setTimeout(rs, 1000);
    }),
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
  clock: [lastCreatedStreamUpdated, pageGate.state, streamRevalidationTimerFx.doneData],
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

split({
  source: combine($stream, $pageError, $tokens, (stream, pageError, tokens) => {
    if (pageError || !stream || !tokens[stream.token_account_id]) return null;
    return {
      stream,
      token: tokens[stream.token_account_id],
    };
  }),
  match: (upd) => (upd ? 'dataUpdated' : 'noData'),
  cases: {
    dataUpdated,
    noData,
  },
});

sample({
  clock: $stream,
  fn: (stream) => (stream ? getStreamLink(stream.id) : null),
  target: $link,
});

sample({
  clock: [dataUpdated, drawRetriggered],
  source: {accountId: $accountId, oracle: $priceOracle},
  fn({accountId, oracle: {getPriceInUsd: toUsd}}, {stream, token}) {
    const {decimals, symbol} = token.meta;
    const tokenId = token.roketoMeta.account_id;
    const {cliffEndTimestamp, timeLeft, progress, percentages} = streamViewData(stream);
    const available = getAvailableToWithdraw(stream).toNumber();
    const direction = getStreamDirection(stream, accountId);
    const isOutgoingStream = direction === STREAM_DIRECTION.OUT;
    let color: string | null = null;
    let comment: string | null = null;
    try {
      const parsed = JSON.parse(stream.description);
      color = parsed.col ?? null;
      comment = parsed.c ?? parsed.comment ?? null;
    } catch {
      /** if description is an empty string, use null instead */
      comment = stream.description || null;
    }
    let subheader: string;
    let sign: string;
    switch (direction) {
      case STREAM_DIRECTION.IN:
        subheader = 'Incoming stream';
        sign = '+';
        break;
      case STREAM_DIRECTION.OUT:
        subheader = 'Outgoing stream';
        sign = '-';
        break;
      case null:
      default:
        subheader = 'Stream';
        sign = '';
        break;
    }
    const streamedInUsd = toUsd(tokenId, toHumanReadableValue(decimals, progress.streamed, 4), 2);
    const totalInUsd = toUsd(tokenId, toHumanReadableValue(decimals, progress.full, 4), 2);
    return {
      active: true,
      sender: direction === STREAM_DIRECTION.OUT ? 'You' : stream.owner_id,
      receiver: direction === STREAM_DIRECTION.IN ? 'You' : stream.receiver_id,
      amount: formatAmount(decimals, progress.full),
      tokenSymbol: symbol,
      cliff: cliffEndTimestamp
        ? {
            title: isPast(cliffEndTimestamp) ? 'Cliff Period Ended' : 'Cliff Period Ends',
            value: formatTimeLeft(cliffEndTimestamp - Date.now()),
          }
        : null,
      remaining: timeLeft || 'Finished',
      tokensAvailable: hasPassedCliff(stream) ? formatAmount(decimals, available) : '0',
      progressText: `${sign}${formatAmount(decimals, progress.streamed)} of ${formatAmount(
        decimals,
        progress.full,
      )}`,
      progressInUSD: `${sign}$${streamedInUsd} of $${totalInUsd}`,
      withdrawnText: formatSmartly(Number(toHumanReadableValue(decimals, progress.withdrawn, 3))),
      cliffPercent: percentages.cliff,
      withdrawn: progress.withdrawn,
      streamed: progress.streamed,
      total: progress.full,
      isLocked: stream.is_locked,
      speed: getStreamingSpeed(Number(stream.tokens_per_sec), token),
      color,
      comment,
      showControls: !isDead(stream),
      showAddFundsButton: isOutgoingStream && !isLocked(stream),
      showWithdrawButton:
        direction === STREAM_DIRECTION.IN && stream.status === STREAM_STATUS.Active,
      subheader,
      direction,
    };
  },
  target: $streamInfo,
});

/** when redraw timer ends, send actual data to retrigger event */
sample({
  clock: [progressRedrawTimerFx.doneData],
  source: dataUpdated,
  target: drawRetriggered,
});

/**
 * while page is open and stream is not complete yet,
 * redraw progress bas each second
 * */
sample({
  clock: [$stream, progressRedrawTimerFx.doneData],
  filter: combine(
    pageGate.status,
    progressRedrawTimerFx.pending,
    $stream,
    (status, pending, stream) => {
      if (!status || pending || !stream) return false;
      return Boolean(stream && !isIdling(stream) && streamViewData(stream).percentages.left > 0);
    },
  ),
  target: [progressRedrawTimerFx],
});

$streamInfo.reset([noData]);
