import type {RichToken, TokenMetadata} from '@roketo/sdk/dist/types';
import BigNumber from 'bignumber.js';
import {addDays, addHours, addMinutes, addMonths, addWeeks, differenceInDays} from 'date-fns';

import {tokensPerMeaningfulPeriod, toYocto} from '~/shared/api/token-formatter';
import {SECONDS_IN_DAY, SECONDS_IN_HOUR, SECONDS_IN_MINUTE} from '~/shared/constants';

export const getDurationInSeconds = (
  months: number,
  days: number,
  hours: number,
  minutes: number,
) => {
  const daysInMonths = differenceInDays(addMonths(new Date(), months), new Date());

  const durationInSeconds =
    (daysInMonths + days) * SECONDS_IN_DAY + minutes * SECONDS_IN_MINUTE + hours * SECONDS_IN_HOUR;

  return durationInSeconds;
};

export const getTokensPerSecondCount = (
  meta: TokenMetadata,
  deposit: number,
  durationInSeconds: number,
) => {
  const depositInYocto = toYocto(meta.decimals, deposit);
  const value = new BigNumber(depositInYocto).dividedToIntegerBy(durationInSeconds).toFixed();

  return value !== 'Infinity' && value !== 'NaN' ? value : '0';
};

export const getStreamingSpeed = (speedInSeconds: number | string, token: RichToken): string => {
  if (Number(speedInSeconds) <= 0) {
    return 'none';
  }

  const {meta} = token;
  const {formattedValue, unit} = tokensPerMeaningfulPeriod(meta.decimals, speedInSeconds);

  return `${formattedValue} ${meta.symbol} / ${unit}`;
};

const durationRE = /(-?(?:\d+\.?\d*|\d*\.?\d+)(?:e[-+]?\d+)?)\s*([\p{L}]*)/giu;

const tagsAlias = {
  min: 'min',
  hr: 'h',
  h: 'h',
  d: 'd',
  wk: 'w',
  w: 'w',
  m: 'm',
} as const;

export function parseDuration(str: string) {
  const resultMap = {
    min: 0,
    h: 0,
    d: 0,
    w: 0,
    m: 0,
  };
  str.replace(durationRE, (_, n, units) => {
    const tag = tagsAlias[units as keyof typeof tagsAlias];
    if (tag) {
      resultMap[tag] = parseFloat(n);
    }
    return _;
  });
  const now = new Date();
  let resultTime = now;
  resultTime = addMonths(resultTime, resultMap.m);
  resultTime = addWeeks(resultTime, resultMap.w);
  resultTime = addDays(resultTime, resultMap.d);
  resultTime = addHours(resultTime, resultMap.h);
  resultTime = addMinutes(resultTime, resultMap.min);
  return +resultTime - +now;
}
