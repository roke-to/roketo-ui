import numbro from 'numbro';

export const tokens = {
  NEAR: {
    decimals: 24,
    name: 'Near',
  },
  TARAS: {
    decimals: 18,
    name: 'Taras',
  },
  fallback: {
    decimals: 18,
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
    amount: (amount) =>
      numbro(amount).divide(MP).format({
        mantissa: 2,
      }),
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
          console.log({
            multiplier,
            unit: unit[multiplier],
            value,
          });
          return isOk;
        }) || TICK_TO_YEAR;

      console.log({
        firstGoodLookingMultiplier,
        unit: unit[firstGoodLookingMultiplier],
      });
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
