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
    ticksToMs: (ticks) => Math.round(ticks / TICK_TO_MS),
  };
}
