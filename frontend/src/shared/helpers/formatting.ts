import numbro from 'numbro';

export const tokens = {
  NEAR: {
    name: 'Near',
    decimals: 24,
    address: null,
    is_mainnet: true,
    is_testnet: true,
  },
  fallback: {
    name: null,
    decimals: 18,
    address: null,
    is_mainnet: false,
    is_testnet: false,
  },
};

export function TokenFormatter(tokenDecimals: number) {
  const TICK_TO_MS = 10 ** 6;
  const TICK_TO_S = 10 ** 9;
  const TICK_TO_MINUTE = TICK_TO_S * 60;
  const TICK_TO_HOUR = TICK_TO_MINUTE * 60;
  const TICK_TO_DAY = TICK_TO_HOUR * 24;
  const TICK_TO_WEEK = TICK_TO_DAY * 7;
  const TICK_TO_MONTH = TICK_TO_WEEK * 4;
  const TICK_TO_YEAR = TICK_TO_MONTH * 12;

  const MP = 10 ** tokenDecimals;

  // const bigValueFormatter = Intl.NumberFormat('en-US', {
  //   minimumIntegerDigits: 1,
  //   maximumFractionDigits: 2,
  //   minimumFractionDigits: 2,
  // });
  // const smallValueFormatter = Intl.NumberFormat('en-US', {
  //   minimumSignificantDigits: 2,
  //   maximumSignificantDigits: 4,
  //   maximumFractionDigits: tokenDecimals,
  // });

  const formatSmartly = (value: numbro.Numbro | number) => 
    // if (value < 1) {
    //   return smallValueFormatter.format(value);
    // }
    
    // if (value < 1000000) {
    //   return bigValueFormatter.format(value);
    // }

     numbro(value).format({
      mantissa: 3,
      trimMantissa: true,
      optionalMantissa: true,
      average: true,
    })
  ;

  return {
    tokenPerSecondToInt: (tps: number) => numbro(tps).multiply(MP).divide(TICK_TO_S).format({
      mantissa: 0,
    }),
    toInt: (floatValue: number) => numbro(floatValue).multiply(MP).format({ mantissa: 0 }),
    amount: (amount: number) => {
      const value = numbro(amount).divide(MP).value();
      const formatted = formatSmartly(value);
      return formatted;
    },
    tokensPerMS: (tokensPerTick: number) => {
      const value = numbro(tokensPerTick).multiply(TICK_TO_MS).divide(MP);
      return formatSmartly(value);
    },
    tokensPerS: (tokensPerTick: number) => {
      const value = numbro(tokensPerTick)
        .multiply(TICK_TO_S)
        .divide(MP)
        .value();

      return formatSmartly(value);
    },

    tokensPerMeaningfulPeriod: (tokensPerTick: number) => {
      // tries to find the best interval for display
      // to avoid 0.0000000000000000000000000009839248 tokens per sec
      const multipliers = [
        TICK_TO_S,
        TICK_TO_MINUTE,
        TICK_TO_HOUR,
        TICK_TO_DAY,
        TICK_TO_WEEK,
        TICK_TO_MONTH,
        TICK_TO_YEAR,
      ];
      const unit = {
        [TICK_TO_S]: 'second',
        [TICK_TO_MINUTE]: 'minute',
        [TICK_TO_HOUR]: 'hour',
        [TICK_TO_DAY]: 'day',
        [TICK_TO_WEEK]: 'week',
        [TICK_TO_MONTH]: 'month',
        [TICK_TO_YEAR]: 'year',
      };
      const firstGoodLookingMultiplier = multipliers.find((multiplier) => {
        const value = numbro(tokensPerTick)
          .multiply(multiplier)
          .divide(MP)
          .value();
        const isOk = value > 0.01;
        return isOk;
      }) || TICK_TO_YEAR;

      const value = numbro(tokensPerTick)
        .multiply(firstGoodLookingMultiplier)
        .divide(MP)
        .value();

      return {
        formattedValue: formatSmartly(value),
        unit: unit[firstGoodLookingMultiplier],
      };
    },
    ticksToMs: (ticks: number) => Math.round(ticks / TICK_TO_MS),
    secondsToTicks: (seconds: number) => seconds * TICK_TO_S,
    speedPerSecondToTick: (speedPerSec: number) => numbro(speedPerSec).multiply(TICK_TO_S).value(),
  };
}

export function timestamp(value: number) {
  return {
    fromNanosec() {
      return value / 1000 / 1000;
    },
  };
}
