import BigNumber from 'bignumber.js';
import {addMonths, differenceInDays} from 'date-fns';

import type {RichToken} from '~/shared/api/ft';
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

export const getTokensPerSecondCount = (depositInYocto: string, durationInSeconds: number) => {
  const value = new BigNumber(depositInYocto).dividedToIntegerBy(durationInSeconds).toFixed();

  return value !== 'Infinity' && value !== 'NaN' ? value : '0';
};

export const getStreamingSpeed = (speedInSeconds: number | string, token: RichToken): string => {
  if (Number(speedInSeconds) <= 0) {
    return 'none';
  }

  const {formatter, meta} = token;
  const {formattedValue, unit} = formatter.tokensPerMeaningfulPeriod(speedInSeconds);

  return `${formattedValue} ${meta.symbol} / ${unit}`;
};
