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
      numbro(tokensPerTick)
        .multiply(TICK_TO_MS)
        .divide(MP)
        .format({
          mantissa: token.decimals - 6,
          trimMantissa: true,
        }),
    tokensPerS: (tokensPerTick) =>
      numbro(tokensPerTick)
        .multiply(TICK_TO_S)
        .divide(MP)
        .format({
          mantissa: token.decimals - 6,
          trimMantissa: true,
        }),
    ticksToMs: (ticks) => Math.round(ticks / TICK_TO_MS),
  };
}
