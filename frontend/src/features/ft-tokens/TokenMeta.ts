export class TokenMeta {
  ticker = '';

  metadata = {
    spec: 'ft-1.0.0',
    name: '',
    symbol: '',
    icon: '',
    reference: null,
    reference_hash: null,
    decimals: 18,
  };

  constructor({ ticker, metadata }: { ticker: any, metadata: any }) {
    this.ticker = ticker;
    this.metadata = metadata;
  }
}
