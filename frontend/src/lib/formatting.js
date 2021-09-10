import numbro from 'numbro';

export const tokens = {
  NEAR: {
    name: 'Near',
    decimals: 24,
    address: null,
    is_mainnet: true,
    is_testnet: true,
  },
  TARAS: {
    name: 'Taras',
    decimals: 18,
    address: 'dev-1630798753809-34755859843881',
    is_mainnet: false,
    is_testnet: true,
  },
  XYI: {
    name: 'XYI',
    decimals: 18,
    address: 'xyi.tkn.near',
    is_mainnet: true,
    is_testnet: false,
  },
  fallback: {
    name: null,
    decimals: 18,
    address: null,
    is_mainnet: false,
    is_testnet: false,
  },
};

export function TokenFormatter(tokenName) {
  let token = tokens[tokenName] || tokens.fallback;

  const TICK_TO_MS = Math.pow(10, 6);
  const TICK_TO_S = Math.pow(10, 9);
  const TICK_TO_MINUTE = TICK_TO_S * 60;
  const TICK_TO_HOUR = TICK_TO_MINUTE * 60;
  const TICK_TO_DAY = TICK_TO_HOUR * 24;
  const TICK_TO_WEEK = TICK_TO_DAY * 7;
  const TICK_TO_MONTH = TICK_TO_WEEK * 4;
  const TICK_TO_YEAR = TICK_TO_MONTH * 12;

  const MP = Math.pow(10, token.decimals);

  return {
    tokenPerSecondToInt: (tps) =>
      numbro(tps).multiply(MP).divide(TICK_TO_S).format({mantissa: 0}),
    toInt: (floatValue) =>
      numbro(floatValue).multiply(MP).format({mantissa: 0}),
    amount: (amount, decimals = token.decimals) => {
      const formatter = Intl.NumberFormat('en-US', {
        minimumSignificantDigits: 2,
        maximumSignificantDigits: 6,
        minimumFractionDigits: 2,
      });
      // .format({
      // mantissa: decimals >= 0 && decimals < 20 ? decimals : 2,
      //  });
      return formatter.format(numbro(amount).divide(MP).value());
    },
    tokensPerMS: (tokensPerTick) =>
      numbro(tokensPerTick).multiply(TICK_TO_MS).divide(MP).format({
        mantissa: 6,
        trimMantissa: true,
      }),
    tokensPerS: (tokensPerTick) =>
      numbro(tokensPerTick).multiply(TICK_TO_S).divide(MP).format({
        average: true,
        mantissa: 6,
        optionalMantissa: true,
        trimMantissa: true,
      }),
    tokensPerMeaningfulPeriod: (tokensPerTick) => {
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
      const firstGoodLookingMultiplier =
        multipliers.find((multiplier) => {
          const value = numbro(tokensPerTick)
            .multiply(multiplier)
            .divide(MP)
            .value();
          const isOk = value > 0.01;
          return isOk;
        }) || TICK_TO_YEAR;

      return {
        formattedValue: numbro(tokensPerTick)
          .multiply(firstGoodLookingMultiplier)
          .divide(MP)
          .format({
            mantissa: 5,
            optionalMantissa: true,
            trimMantissa: true,
          }),
        unit: unit[firstGoodLookingMultiplier],
      };
    },
    ticksToMs: (ticks) => Math.round(ticks / TICK_TO_MS),
  };
}

export function timestamp(value) {
  return {
    fromNanosec() {
      return value / 1000 / 1000;
    },
  };
}
