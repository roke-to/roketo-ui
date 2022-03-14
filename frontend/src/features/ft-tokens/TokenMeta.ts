export type TokenTicker = string;

export type TokenMetadata = {
  spec: null,
  name: string,
  symbol: string,
  icon: '',
  reference: null,
  reference_hash: null,
  decimals: number,
};

export class TokenMeta {
  ticker: TokenTicker;

  metadata: TokenMetadata;

  constructor({ ticker, metadata }: { ticker: TokenTicker, metadata: TokenMetadata }) {
    this.ticker = ticker;
    this.metadata = metadata;
  }
}
