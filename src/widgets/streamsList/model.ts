import {BigNumber} from 'bignumber.js';
import {combine, createEffect, createEvent, createStore, sample} from 'effector';
import {createGate} from 'effector-react';
import {generatePath} from 'react-router-dom';

import {streamViewData} from '~/features/roketo-resource';

import {$accountId, $tokens} from '~/entities/wallet';

import {STREAM_DIRECTION} from '~/shared/api/roketo/constants';
import type {RoketoStream} from '~/shared/api/roketo/interfaces/entities';
import {getStreamDirection} from '~/shared/api/roketo/lib';
import {
  formatSmartly,
  toHumanReadableValue,
  tokensPerMeaningfulPeriod,
} from '~/shared/api/token-formatter';
import type {RichToken} from '~/shared/api/types';
import {isWNearTokenId} from '~/shared/lib/isWNearTokenId';
import {getRoundedPercentageRatio} from '~/shared/lib/math';
import {ROUTES_MAP} from '~/shared/lib/routing';

export const filteredStreamsGate = createGate<RoketoStream[]>({defaultState: []});

type ProgressContextData = {
  streams: RoketoStream[];
  tokens: Record<string, RichToken>;
};

const dataUpdated = createEvent<ProgressContextData>();
const drawRetriggered = createEvent<ProgressContextData>();

const progressRedrawTimerFx = createEffect(
  () =>
    new Promise<void>((rs) => {
      setTimeout(rs, 1000);
    }),
);

type StreamCardData = {
  streamPageLink: string;
  comment: string;
  color: string;
  name: string;
  isIncomingStream: boolean;
  isLocked: boolean;
};

type StreamProgressData = {
  symbol: string;
  progressText: string;
  progressFull: string;
  progressStreamed: string;
  progressWithdrawn: string;
  cliffPercent: number | null;
  speedFormattedValue: string;
  speedUnit: string;
  timeLeft: string;
  streamedText: string;
  streamedPercentage: BigNumber;
  withdrawnText: string;
  withdrawnPercentage: BigNumber;
};

export const streamCardDataDefaults: StreamCardData = {
  streamPageLink: '',
  comment: '',
  color: '',
  name: '',
  isIncomingStream: false,
  isLocked: false,
};

export const streamProgressDataDefaults: StreamProgressData = {
  symbol: '',
  progressText: '',
  progressFull: '',
  progressStreamed: '',
  progressWithdrawn: '',
  cliffPercent: null,
  speedFormattedValue: '',
  speedUnit: '',
  timeLeft: '',
  streamedText: '',
  streamedPercentage: new BigNumber(0),
  withdrawnText: '',
  withdrawnPercentage: new BigNumber(0),
};

export const $streamCardsData = createStore<Record<string, StreamCardData>>(
  {},
  {
    updateFilter: (a, b) => !shallowCompareRecords(a, b),
  },
);

export const $streamsProgress = createStore<Record<string, StreamProgressData>>(
  {},
  {
    updateFilter: (a, b) => !shallowCompareRecords(a, b),
  },
);

sample({
  source: {
    tokens: $tokens,
    streams: filteredStreamsGate.state,
  },
  target: dataUpdated,
});

/** when redraw timer ends, send actual data to retrigger event */
sample({
  clock: progressRedrawTimerFx.doneData,
  source: dataUpdated,
  target: drawRetriggered,
});

/** while page is open redraw progress bar each second */
sample({
  clock: [filteredStreamsGate.state, progressRedrawTimerFx.doneData],
  filter: combine(
    filteredStreamsGate.status,
    progressRedrawTimerFx.pending,
    (status, pending) => status && !pending,
  ),
  target: [progressRedrawTimerFx],
});

sample({
  clock: [dataUpdated, drawRetriggered],
  source: $streamsProgress,
  fn(oldData, {streams, tokens}) {
    const result = {} as unknown as Record<string, StreamProgressData>;
    // eslint-disable-next-line no-restricted-syntax
    for (const stream of streams) {
      const {id, token_account_id: tokenId, tokens_per_sec: tokensPerSec} = stream;
      const token = tokens[tokenId];
      // eslint-disable-next-line no-continue
      if (!token) continue;
      const {decimals} = token.meta;
      const symbol = isWNearTokenId(tokenId) ? 'NEAR' : token.meta.symbol;
      const {progress, timeLeft, percentages} = streamViewData(stream);
      const streamed = Number(toHumanReadableValue(decimals, progress.streamed, 3));
      const withdrawn = Number(toHumanReadableValue(decimals, progress.withdrawn, 3));
      const total = Number(toHumanReadableValue(decimals, progress.full, 3));

      const streamedText = formatSmartly(streamed);
      const withdrawnText = formatSmartly(withdrawn);

      const streamedPercentage = getRoundedPercentageRatio(progress.streamed, progress.full, 1);
      const withdrawnPercentage = getRoundedPercentageRatio(
        progress.withdrawn,
        progress.streamed,
        1,
      );

      const progressText = `${streamedText} of ${total}`;

      const {formattedValue: speedFormattedValue, unit: speedUnit} = tokensPerMeaningfulPeriod(
        decimals,
        tokensPerSec,
      );
      result[id] = selectResultRecord(
        {
          symbol,
          progressText,
          progressFull: progress.full,
          progressStreamed: progress.streamed,
          progressWithdrawn: progress.withdrawn,
          cliffPercent: percentages.cliff,
          speedFormattedValue,
          speedUnit,
          timeLeft,
          streamedText,
          streamedPercentage,
          withdrawnText,
          withdrawnPercentage,
        },
        oldData[id],
      );
    }
    return result;
  },
  target: $streamsProgress,
});

sample({
  clock: filteredStreamsGate.state,
  source: {accountId: $accountId, oldData: $streamCardsData},
  fn: ({accountId, oldData}, streams) =>
    Object.fromEntries(
      streams.map((stream) => {
        const {id} = stream;
        let comment = '';
        let color = 'transparent';

        try {
          const parsedDescription = JSON.parse(stream.description);
          comment = parsedDescription.comment ?? parsedDescription.c;
          color = parsedDescription.col;
        } catch {
          comment = stream.description;
        }
        const direction = getStreamDirection(stream, accountId);
        const isIncomingStream = direction === STREAM_DIRECTION.IN;
        return [
          id,
          selectResultRecord(
            {
              streamPageLink: generatePath(ROUTES_MAP.stream.path, {id}),
              comment,
              color,
              name: isIncomingStream ? stream.owner_id : stream.receiver_id,
              isIncomingStream,
              isLocked: stream.is_locked,
            },
            oldData[id],
          ),
        ];
      }),
    ),
  target: $streamCardsData,
});

function shallowCompareRecords<T>(a: Record<string, T>, b: Record<string, T>) {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;
  for (let i = 0; i < aKeys.length; i += 1) {
    const key = aKeys[i];
    if (bKeys[i] !== key || a[key] !== b[key]) return false;
  }
  return true;
}

function selectResultRecord<T>(update: T, currentValue: T) {
  return shallowCompareSameShape(update, currentValue) ? currentValue : update;
}

function shallowCompareSameShape<T>(a: T, b: T) {
  if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) return a === b;
  // eslint-disable-next-line no-restricted-syntax
  for (const key in a) {
    if (a[key] !== b[key]) return false;
  }
  return true;
}
