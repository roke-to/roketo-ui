type TokenId = string;

export type TokenPriceValue = {
  multiplier: string,
  decimals: number,
};

export type TokenPriceValueCollection = {
  [tokenId: TokenId]: TokenPriceValue,
};
