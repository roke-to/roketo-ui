import BigNumber from 'bignumber.js';
import {formatDuration, intervalToDuration, millisecondsToSeconds} from 'date-fns';

import {STREAM_STATUS} from 'shared/api/roketo/constants';
import {fromNanosecToSec, shortEnLocale} from 'shared/helpers/date';
import {SECONDS_IN_YEAR} from 'shared/constants';

import {Stream} from './types';

export const isActiveStream = (stream: Stream) => stream.status === STREAM_STATUS.Active;

const isIdling = (stream: Stream) => (
  stream.status === STREAM_STATUS.Initialized
  || stream.status === STREAM_STATUS.Paused
);

export const isDead = (stream?: Stream) => (
  typeof stream?.status === 'object'
  && STREAM_STATUS.Finished in stream.status
);

export const getAvailableToWithdraw = (stream: Stream): BigNumber => {
  if (isIdling(stream)) {
    return new BigNumber(0);
  }

  const nowSec = millisecondsToSeconds(Date.now());
  const lastActionSec = fromNanosecToSec(stream.last_action);
  const period = nowSec - lastActionSec;

  return BigNumber.minimum(
    stream.balance,
    Number(stream.tokens_per_sec) * period
  );
}

export const streamViewData = (stream: Stream) => {
  const MAX_SEC = SECONDS_IN_YEAR * 1000;

  const availableToWithdraw = getAvailableToWithdraw(stream);

  const secondsLeft = BigNumber.minimum(
    MAX_SEC,
    new BigNumber(stream.balance)
      .minus(availableToWithdraw)
      .dividedBy(stream.tokens_per_sec)
      .toFixed()
  ).toNumber();


  const duration = intervalToDuration({start: 0, end: secondsLeft * 1000});

  if (duration.days || duration.weeks || duration.months || duration.years) {
    duration.seconds = 0;
  }

  const timeLeft = formatDuration(duration, {locale: shortEnLocale});

  // progress bar calculations
  const full = new BigNumber(stream.balance).plus(stream.tokens_total_withdrawn);
  const withdrawn = new BigNumber(stream.tokens_total_withdrawn);
  const streamed = withdrawn.plus(availableToWithdraw);

  const left = full.minus(streamed);
  const progresses = [
    withdrawn.dividedBy(full).toNumber(),
    streamed.dividedBy(full).toNumber()
  ];

  const percentages = {
    left: full.minus(streamed).dividedBy(full).toNumber(),
    streamed: streamed.dividedBy(full).toNumber(),
    withdrawn: withdrawn.dividedBy(full).toNumber(),
    available: availableToWithdraw.dividedBy(full).toNumber(),
  };

  return {
    progresses,
    isDead: isDead(stream),
    percentages,
    timeLeft,
    progress: {
      full: full.toFixed(),
      withdrawn: withdrawn.toFixed(),
      streamed: streamed.toFixed(),
      left: left.toFixed(),
      available: availableToWithdraw.toFixed(),
    },
  };
}
