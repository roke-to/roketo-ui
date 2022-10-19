import type {RoketoStream} from '@roketo/sdk/dist/types';
import {BigNumber} from 'bignumber.js';
import {formatDuration, intervalToDuration} from 'date-fns';

const SECONDS_IN_MINUTE = 60;
const SECONDS_IN_HOUR = SECONDS_IN_MINUTE * 60;
const SECONDS_IN_DAY = SECONDS_IN_HOUR * 24;
const SECONDS_IN_WEEK = SECONDS_IN_DAY * 7;
const SECONDS_IN_MONTH = SECONDS_IN_WEEK * 4;
const SECONDS_IN_YEAR = SECONDS_IN_MONTH * 12;

const formatDistanceLocale = {
  xYears: '{{count}} years',
  xMonths: '{{count}} months',
  xDays: '{{count}}d',
  xSeconds: '{{count}}s',
  xMinutes: '{{count}}m',
  xHours: '{{count}}h',
} as const;

type TokenType = keyof typeof formatDistanceLocale;

const shortEnLocale = {
  formatDistance: (token: TokenType, count: string) =>
    formatDistanceLocale[token].replace('{{count}}', count),
};

export function printDuration(stream: RoketoStream) {
  const endTime = calculateEndTimestamp(stream);
  if (!endTime) return null;
  const startTime = stream.timestamp_created / 1_000_000;
  const duration = intervalToDuration({start: startTime, end: endTime});
  if (duration.days || duration.weeks || duration.months || duration.years) {
    duration.seconds = 0;
  }
  return formatDuration(duration, {locale: shortEnLocale});
}

function calculateEndTimestamp(stream: RoketoStream) {
  const tokensPerMs = new BigNumber(stream.tokens_per_sec).dividedBy(1000);
  const lastActionTime = stream.last_action / 1000_000;

  const timeToCompleteEntireStream = new BigNumber(stream.balance)
    .dividedBy(tokensPerMs)
    .toNumber();
  if (lastActionTime < timeToCompleteEntireStream) {
    return lastActionTime + SECONDS_IN_YEAR * 100;
  }
  /**
   * if this stream is active but 100% complete then it will be a time in the past
   * as well as in the case of "Finished" stream
   * othewise this stream is still working and this time will be in the future
   */
  return lastActionTime + timeToCompleteEntireStream;
}
