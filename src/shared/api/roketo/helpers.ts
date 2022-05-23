import BigNumber from 'bignumber.js';
import { millisecondsToSeconds } from 'date-fns';

import { fromNanosecToSec } from 'shared/helpers/date';

import { STREAM_STATUS } from './constants';
import { RoketoStream, RoketoAccount } from './interfaces/entities';

export const isActiveStream = (stream: RoketoStream) => stream.status === STREAM_STATUS.Active;
export const isPausedStream = (stream: RoketoStream) => stream.status === STREAM_STATUS.Paused;

function isIdling(stream: RoketoStream) {
  return (
    stream.status === STREAM_STATUS.Initialized
    || stream.status === STREAM_STATUS.Paused
  );
}

export function isDead(stream?: RoketoStream) {
  return typeof stream?.status === 'object' && STREAM_STATUS.Finished in stream.status;
}

export function getAvailableToWithdraw(stream: RoketoStream): BigNumber {
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

export function getStreamEndTime(stream: RoketoStream) {
  if (!isActiveStream(stream)) {
    return {
      hasEndTime: false,
      endTime: 0,
    }
  }
  const balance = new BigNumber(stream.balance)
  const tokensPerMs = new BigNumber(stream.tokens_per_sec).dividedBy(1000)
  const lastActionTime = stream.last_action / 1000000
  const timeActive = Date.now() - lastActionTime
  const tokensSpentSinceLastActivation = tokensPerMs.multipliedBy(timeActive)
  /** this stream is complete (spent 100% its tokens) but still has status "Active" */
  if (balance.isLessThan(tokensSpentSinceLastActivation)) {
    /** this token was never paused and was started immediately */
    if (stream.timestamp_created === stream.last_action) {
      const timeToCompleteEntireStream = balance.dividedBy(tokensPerMs).toNumber()
      const endTime = lastActionTime + timeToCompleteEntireStream
      return {
        hasEndTime: true,
        endTime,
      }
    }
    return {
      hasEndTime: false,
      endTime: 0,
    }
  }
  /** balance changes when stream status changes, for active stream actual balance is smaller */
  const balanceLeft = balance.minus(tokensSpentSinceLastActivation)
  const timeLeft = balanceLeft.dividedBy(tokensPerMs).toNumber()
  return {
    hasEndTime: true,
    endTime: Date.now() + timeLeft
  }
}

export const getEmptyAccount = (): RoketoAccount => ({
  active_incoming_streams: 0,
  active_outgoing_streams: 0,
  deposit: "0",
  inactive_incoming_streams: 0,
  inactive_outgoing_streams: 0,
  is_cron_allowed: true,
  last_created_stream: "any",
  stake: "0",
  total_incoming: {},
  total_outgoing: {},
  total_received: {}
});
