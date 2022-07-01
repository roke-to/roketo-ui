import {BigNumber} from 'bignumber.js';
import {format, isPast} from 'date-fns';
import {combine, createEffect, createEvent, createStore, sample, split} from 'effector';
import {createGate} from 'effector-react';

import {getStreamingSpeed} from '~/features/create-stream/lib';
import {streamViewData} from '~/features/roketo-resource';

import {$accountId, $roketoWallet, $tokens, lastCreatedStreamUpdated} from '~/entities/wallet';

import {getStream} from '~/shared/api/methods';
import {STREAM_DIRECTION, STREAM_STATUS} from '~/shared/api/roketo/constants';
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
import {RichToken} from '~/shared/api/types';
import {getRoundedPercentageRatio} from '~/shared/lib/math';
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
export const $color = $stream.map((stream): string | null => {
  const description = stream?.description;
  if (!description) return null;
  try {
    const parsed = JSON.parse(description);
    return parsed.col ?? null;
  } catch {
    return null;
  }
});

const dataUpdated = createEvent<{
  stream: RoketoStream;
  token: RichToken;
}>();
const drawRetriggered = createEvent<{
  stream: RoketoStream;
  token: RichToken;
}>();
const noData = createEvent<unknown>();

export const $comment = createStore<string | null>(null);
export const $speed = createStore<string | null>(null);
export const $link = createStore<string | null>(null);

export const $streamProgress = createStore({
  active: false,
  tokenAccountId: '',
  progressText: '',
  streamedText: '',
  withdrawnText: '',
  streamedPercentage: new BigNumber(0),
  withdrawnPercentage: new BigNumber(0),
  cliffPercent: null as number | null,
  withdrawn: '',
  streamed: '',
  total: '',
});

export const $streamInfo = createStore({
  active: false,
  sender: '',
  receiver: '',
  amount: '',
  tokenSymbol: '',
  tokenName: '',
  streamId: '',
  created: '',
  cliff: null as null | {title: string; value: string},
  end: null as null | {title: string; value: string},
  remaining: '',
  transferred: '',
  streamedToTotalPercentageRatio: 0,
  showLatestWithdrawal: false,
  latestWithdrawal: '',
  tokensLeft: '',
  leftToTotalPercentageRatio: 0,
  tokensAvailable: '',
});

export const $buttonsFlags = createStore({
  isAlive: false,
  showAddFundsButton: false,
  showWithdrawButton: false,
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
  clock: [dataUpdated, drawRetriggered],
  fn({token: {meta}, stream}) {
    const {progress, percentages} = streamViewData(stream);
    return {
      active: true,
      tokenAccountId: stream.token_account_id,
      progressText: `${meta.symbol} ${formatAmount(
        meta.decimals,
        progress.streamed,
      )} of ${formatAmount(meta.decimals, progress.full)}`,
      streamedText: formatSmartly(
        Number(toHumanReadableValue(meta.decimals, progress.streamed, 3)),
      ),
      withdrawnText: formatSmartly(
        Number(toHumanReadableValue(meta.decimals, progress.withdrawn, 3)),
      ),
      streamedPercentage: getRoundedPercentageRatio(progress.streamed, progress.full, 1),
      withdrawnPercentage: getRoundedPercentageRatio(progress.withdrawn, progress.streamed, 1),
      cliffPercent: percentages.cliff,
      withdrawn: progress.withdrawn,
      streamed: progress.streamed,
      total: progress.full,
    };
  },
  target: $streamProgress,
});

sample({
  clock: $stream,
  filter: Boolean,
  fn(stream) {
    let comment: string | void;
    try {
      const parsedDescription = JSON.parse(stream.description);
      comment = parsedDescription.comment ?? parsedDescription.c;
    } catch {
      comment = stream.description;
    }
    return comment ?? null;
  },
  target: $comment,
});

sample({
  clock: [dataUpdated, drawRetriggered],
  fn: ({stream, token}) => getStreamingSpeed(Number(stream.tokens_per_sec), token),
  target: $speed,
});

sample({
  clock: $stream,
  fn: (stream) => (stream ? getStreamLink(stream.id) : null),
  target: $link,
});

sample({
  clock: [dataUpdated, drawRetriggered],
  source: $accountId,
  fn(accountId, {stream, token: {meta}}) {
    const {
      streamEndTimestamp,
      cliffEndTimestamp,
      timeLeft,
      progress: {streamed, left, full},
    } = streamViewData(stream);
    const streamedToTotalPercentageRatio = getRoundedPercentageRatio(streamed, full).toNumber();
    const leftToTotalPercentageRatio = getRoundedPercentageRatio(left, full).toNumber();
    const available = getAvailableToWithdraw(stream).toNumber();
    const direction = getStreamDirection(stream, accountId);
    return {
      active: true,
      sender: direction === STREAM_DIRECTION.OUT ? 'You' : stream.owner_id,
      receiver: direction === STREAM_DIRECTION.IN ? 'You' : stream.receiver_id,
      amount: formatAmount(meta.decimals, full),
      tokenSymbol: meta.symbol,
      tokenName: meta.name,
      streamId: stream.id,
      created: format(new Date(Number(stream.timestamp_created) / 1000000), "PP 'at' p"),
      cliff: cliffEndTimestamp
        ? {
            title: isPast(cliffEndTimestamp) ? 'Cliff Period Ended' : 'Cliff Period Ends',
            value: format(cliffEndTimestamp, "PP 'at' p"),
          }
        : null,
      end: streamEndTimestamp
        ? {
            title: isPast(streamEndTimestamp) ? 'Stream Ended' : 'Stream Ends',
            value: format(streamEndTimestamp, "PP 'at' p"),
          }
        : null,
      remaining: timeLeft || 'Finished',
      transferred: formatAmount(meta.decimals, streamed),
      streamedToTotalPercentageRatio,
      showLatestWithdrawal: stream.timestamp_created !== stream.last_action,
      latestWithdrawal: format(new Date(Number(stream.last_action) / 1000000), "PP 'at' p"),
      tokensLeft: formatAmount(meta.decimals, left),
      leftToTotalPercentageRatio,
      tokensAvailable: hasPassedCliff(stream) ? formatAmount(meta.decimals, available) : '0',
    };
  },
  target: $streamInfo,
});

sample({
  clock: [dataUpdated, drawRetriggered],
  source: $accountId,
  filter: Boolean,
  fn(accountId, {stream}) {
    const direction = getStreamDirection(stream, accountId);
    const isOutgoingStream = direction === STREAM_DIRECTION.OUT;
    return {
      isAlive: !isDead(stream),
      showAddFundsButton: isOutgoingStream && !isLocked(stream),
      showWithdrawButton:
        direction === STREAM_DIRECTION.IN && stream.status === STREAM_STATUS.Active,
    };
  },
  target: $buttonsFlags,
});

/** when redraw timer ends, send actual data to retrigger event */
sample({
  clock: progressRedrawTimerFx.doneData,
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

$streamProgress.reset([noData]);
$speed.reset([noData]);
$streamInfo.reset([noData]);
$buttonsFlags.reset([noData]);
