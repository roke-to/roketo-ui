import BigNumber from 'bignumber.js';
import {addMonths, differenceInDays} from 'date-fns';

import type {RichToken} from '~/shared/api/ft';
import {tokensPerMeaningfulPeriod, toYocto} from '~/shared/api/ft/token-formatter';
import {SECONDS_IN_DAY, SECONDS_IN_HOUR, SECONDS_IN_MINUTE} from '~/shared/constants';
import {TokenMetadata} from '~/shared/api/ft/types';

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
