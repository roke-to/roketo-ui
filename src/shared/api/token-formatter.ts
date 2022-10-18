import numbro from 'numbro';

import {
  SECONDS_IN_DAY,
  SECONDS_IN_HOUR,
  SECONDS_IN_MINUTE,
  SECONDS_IN_MONTH,
  SECONDS_IN_WEEK,
  SECONDS_IN_YEAR,
} from '~/shared/constants';

export function formatSmartly(value: number) {
  if (value === 0) {
    return '0';
  }

  if (value < 0.001) {
    return '<0.001';
  }

  return numbro(value).format({
    mantissa: 3,
    trimMantissa: true,
    optionalMantissa: true,
    average: true,
  });
}

/** for display purposes, converts from yocto values */
export function formatAmount(tokenDecimals: number, amount?: number | string) {
  const MP = 10 ** tokenDecimals;
  const value = numbro(amount).divide(MP).value();
  const formatted = numbro(value).format({
    mantissa: 3,
    trimMantissa: true,
    optionalMantissa: true,
  });

  return formatted;
}

export function toYocto(tokenDecimals: number, value: number | string) {
  const MP = 10 ** tokenDecimals;
  return numbro(value).multiply(MP).format({mantissa: 0});
}

export function toHumanReadableValue(
  tokenDecimals: number,
  amount: number | string,
  decimals: number = 0,
) {
  const MP = 10 ** tokenDecimals;
  return numbro(amount).divide(MP).format({
    mantissa: decimals,
    trimMantissa: true,
    optionalMantissa: true,
  });
}

/**
 * tries to find the best interval for display
 * to avoid 0.0000000000000000000000000009839248 tokens per sec
 */
export function tokensPerMeaningfulPeriod(tokenDecimals: number, tokensPerSec: number | string) {
  const MP = 10 ** tokenDecimals;
  const multipliers = [
    1,
    SECONDS_IN_MINUTE,
    SECONDS_IN_HOUR,
    SECONDS_IN_DAY,
    SECONDS_IN_WEEK,
    SECONDS_IN_MONTH,
    SECONDS_IN_YEAR,
  ];
  const unit = {
    1: 'second',
    [SECONDS_IN_MINUTE]: 'minute',
    [SECONDS_IN_HOUR]: 'hour',
    [SECONDS_IN_DAY]: 'day',
    [SECONDS_IN_WEEK]: 'week',
    [SECONDS_IN_MONTH]: 'month',
    [SECONDS_IN_YEAR]: 'year',
  };

  const firstGoodLookingMultiplier =
    multipliers.find((multiplier) => {
      const value = numbro(tokensPerSec).multiply(multiplier).divide(MP).value();

      const isOk = value > 0.1;
      return isOk;
    }) || SECONDS_IN_YEAR;

  const value = numbro(tokensPerSec).multiply(firstGoodLookingMultiplier).divide(MP).value();

  return {
    formattedValue: formatSmartly(value),
    unit: unit[firstGoodLookingMultiplier],
  };
}
