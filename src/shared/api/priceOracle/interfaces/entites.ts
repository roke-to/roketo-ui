export type TokenId = string;

type Price = {
  multiplier: string,
  decimals: number,
};

type PriceOracleSource = {
  oracle_id: string,
  price: Price,
  timestamp: string,
};

export type TokenPriceRaw = [
  tokenId: TokenId,
  value: {reports: PriceOracleSource[]},
];

export type TokenPriceCollection = {
  [tokenId: TokenId]: Price,
};

export type TokenMultiplierMap = {
  [tokenId: TokenId]: number,
};
