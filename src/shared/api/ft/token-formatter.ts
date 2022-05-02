
import numbro from 'numbro';

import {
  SECONDS_IN_YEAR,
  SECONDS_IN_MONTH,
  SECONDS_IN_WEEK,
  SECONDS_IN_DAY,
  SECONDS_IN_HOUR,
  SECONDS_IN_MINUTE
} from 'shared/constants';

export class TokenFormatter {
  tokenDecimals: number;

  MP: number;

  constructor(tokenDecimals: number ) {
    this.tokenDecimals = tokenDecimals;
    this.MP = 10 ** tokenDecimals;
  }

  static formatSmartly(value: number) {
    if (value !== 0 && value < 0.001) {
      return '<0.001';
    }

    if (value === 0) {
      return '0';
    }

    return numbro(value).format({
     mantissa: 3,
     trimMantissa: true,
     optionalMantissa: true,
     average: true,
   })
  }

  // for display purposes, converts from yocto values
  amount(amount: number | string) {
    const value = numbro(amount).divide(this.MP).value();

    const formatted = numbro(value).format({
      mantissa: 3,
      trimMantissa: true,
      optionalMantissa: true,
      average: true,
    });

    if (value === 0) {
      return '0';
    }

    if (amount !== 0 && value < 0.001) {
      return '<0.001';
    }

    return formatted;
  }

  toYocto(value: number | string) {
    return numbro(value)
      .multiply(this.MP)
      .format({ mantissa: 0 });
  }

  toHumanReadableValue(amount: number | string, decimals: number = 0): string {
    return numbro(amount)
      .divide(this.MP)
      .format({
        mantissa: decimals,
        trimMantissa: true,
        optionalMantissa: true,
      });
  }

  // tries to find the best interval for display
  // to avoid 0.0000000000000000000000000009839248 tokens per sec
  tokensPerMeaningfulPeriod(tokensPerSec: number | string) {
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

    const firstGoodLookingMultiplier = multipliers.find((multiplier) => {
      const value = numbro(tokensPerSec)
        .multiply(multiplier)
        .divide(this.MP)
        .value();

      const isOk = value > 0.1;
      return isOk;
    }) || SECONDS_IN_YEAR;

    const value = numbro(tokensPerSec)
      .multiply(firstGoodLookingMultiplier)
      .divide(this.MP)
      .value();

    return {
      formattedValue: TokenFormatter.formatSmartly(value),
      unit: unit[firstGoodLookingMultiplier],
    };
  }
}
