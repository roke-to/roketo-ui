export type TokenAccountId = string;

type Price = {
  multiplier: string;
  decimals: number;
};

type PriceOracleSource = {
  oracle_id: string;
  price: Price;
  timestamp: string;
};

export type TokenPriceRaw = [tokenAccountId: TokenAccountId, value: {reports: PriceOracleSource[]}];

export type TokenPriceCollection = {
  [tokenAccountId: TokenAccountId]: Price;
};

export type TokenMultiplierMap = {
  [tokenAccountId: TokenAccountId]: number;
};
