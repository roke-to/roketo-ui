import * as nearAPI from 'near-api-js';

import { TokenMeta } from './TokenMeta';

function FTContract(account, address) {
  return new nearAPI.Contract(account, address, {
    viewMethods: ['ft_balance_of', 'ft_metadata', 'storage_balance_of'],
    changeMethods: ['ft_transfer', 'ft_transfer_call'],
  });
}

const NEAR_META = new TokenMeta({
  ticker: 'NEAR',
  metadata: {
    spec: null,
    name: 'Near Protocol',
    symbol: 'NEAR',
    icon: '',
    reference: null,
    reference_hash: null,
    decimals: 24,
  },
});

export class Tokens {
  constructor({ tokens, account }) {
    this.__tokens = tokens;
    this.__account = account;
    this.__contracts = {};
    this.tokens = {};

    if (!tokens || !account) return;

    tokens.forEach((token) => {
      this.__contracts[token.ticker] = FTContract(account, token.account_id);
    });
  }

  get tickers() {
    return Object.keys(this.tokens);
  }

  contract(ticker) {
    return this.__contracts[ticker];
  }

  get(ticker) {
    const token = this.tokens[ticker]
      || new TokenMeta({
        ticker,
        metadata: {
          spec: null,
          name: ticker,
          symbol: ticker,
          icon: '',
          reference: null,
          reference_hash: null,
          decimals: 24,
        },
      });

    return token;
  }

  async init() {
    await Promise.all(
      this.__tokens.map(async (token) => {
        let meta;
        if (token.ticker === 'NEAR') {
          meta = NEAR_META;
        } else if (!token.account_id) {
          meta = new TokenMeta({
            ticker: token.ticker,
            metadata: {
              spec: null,
              name: token.ticker,
              symbol: token.ticker,
              icon: '',
              reference: null,
              reference_hash: null,
              decimals: 24,
            },
          });
        } else {
          // construct Near FT contract for address

          const contract = this.contract(token.ticker);
          const metadata = await contract.ft_metadata();

          if (metadata.decimals < 8) {
            // we cant support anything with decimals less than 8
            return;
          }

          meta = new TokenMeta({
            ticker: token.ticker,
            metadata,
          });
        }

        this.tokens[token.ticker] = meta;
      }),
    );
  }

  async balance(ticker) {
    if (ticker === 'NEAR') {
      const balance = await this.__account.getAccountBalance();
      return balance.total;
    }
    const contract = this.contract(ticker);
    const res = await contract.ft_balance_of({
      account_id: this.__account.accountId,
    });

    return res;
  }

  // Only ft tokens are allowed
  // DO NOT PROVIDE NEAR HERE
  async ftStorageBalance(ticker) {
    const contract = this.contract(ticker);
    const res = await contract.storage_balance_of({
      account_id: this.__account.accountId,
    });

    return res;
  }
}
