import {BigNumber} from 'bignumber.js';
import {millisecondsToSeconds} from 'date-fns';

import {fromNanosecToSec} from '~/shared/lib/date';

import {STREAM_DIRECTION, STREAM_STATUS} from './constants';
import type {RoketoStream} from './interfaces/entities';

export const isActiveStream = (stream: RoketoStream) => stream.status === STREAM_STATUS.Active;
export const isPausedStream = (stream: RoketoStream) => stream.status === STREAM_STATUS.Paused;

export function isIdling(stream: RoketoStream) {
  return stream.status === STREAM_STATUS.Initialized || stream.status === STREAM_STATUS.Paused;
}

export function isDead(stream?: RoketoStream) {
  return typeof stream?.status === 'object' && STREAM_STATUS.Finished in stream.status;
}

export function isWithCliff(stream?: RoketoStream) {
  return Boolean(stream?.cliff);
}

export function hasPassedCliff(stream: RoketoStream) {
  return !stream.cliff || Date.now() > stream.cliff / 1000_000;
}

export function getAvailableToWithdraw(stream: RoketoStream): BigNumber {
  if (isIdling(stream)) {
    return new BigNumber(0);
  }

  const nowSec = millisecondsToSeconds(Date.now());
  const lastActionSec = fromNanosecToSec(stream.last_action);
  const period = nowSec - lastActionSec;

  return BigNumber.minimum(stream.balance, Number(stream.tokens_per_sec) * period);
}

export function isLocked(stream: RoketoStream) {
  return stream.is_locked;
}

export function wasStartedAndLocked(stream: RoketoStream) {
  return isLocked(stream) && stream.status !== STREAM_STATUS.Initialized;
}

export function getStreamDirection(stream: RoketoStream, accountId: string | null) {
  if (stream.receiver_id === accountId) {
    return STREAM_DIRECTION.IN;
  }
  if (stream.owner_id === accountId) {
    return STREAM_DIRECTION.OUT;
  }
  return null;
}

function getStreamLeftPercent(stream: RoketoStream) {
  const full = new BigNumber(stream.balance).plus(stream.tokens_total_withdrawn);
  const availableToWithdraw = getAvailableToWithdraw(stream);
  const withdrawn = new BigNumber(stream.tokens_total_withdrawn);
  const streamed = withdrawn.plus(availableToWithdraw);
  return full.minus(streamed).multipliedBy(100).dividedBy(full).toNumber();
}

export function ableToAddFunds(stream: RoketoStream, accountId: string | null) {
  const direction = getStreamDirection(stream, accountId);
  const isOutgoingStream = direction === STREAM_DIRECTION.OUT;
  const isStreamEnded = getStreamLeftPercent(stream) === 0;
  return isOutgoingStream && !isLocked(stream) && !isStreamEnded && hasPassedCliff(stream);
}
