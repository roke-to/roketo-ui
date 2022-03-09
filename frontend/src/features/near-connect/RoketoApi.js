import * as nearAPI from 'near-api-js';
import { NearContractApi } from './near-contract-api';
import { NEAR_CONFIG as NearConfig } from './config';

export class RoketoApi {
  constructor({ account, walletConnection }) {
    this.inited = false;
    this._walletConnection = walletConnection;
    this._account = account;
    this._contract = null;
    this.ft = {};
    this.status = {
      dao_id: '',
      num_tokens_listed: 0,
      operational_commission: '0',
      tokens: [
        {
          name: '',
          ticker: '',
          account_id: '',
          is_active: false,
          commission_on_create: '0',
          commission_percentage: 0,
          total_commission: '0',
        },
      ],
    };

    this.api = null;
  }

  async init() {
    if (this.inited) return;

    // create Roketo Contract
    this._contract = new nearAPI.Contract(
      this._account,
      NearConfig.contractName,
      {
        viewMethods: [
          'get_account',
          'get_stream',
          'get_stream_history',
          'get_status',
        ],
        changeMethods: [
          'create_stream',
          'deposit',
          'update_account',
          'start_stream',
          'pause_stream',
          'stop_stream',
          'change_auto_deposit',
          'start_cron',
        ],
      },
    );

    // fetch metadata for tokens & commissions
    this.status = await this._contract.get_status({});
    console.log(this.status);
    const { tokens } = this.status;

    // create contracts for every token
    this.ft = {};

    console.debug('Generating FT contracts for', tokens);
    tokens.forEach((token) => {
      // {
      //   name: 'NEAR token',
      //   ticker: 'NEAR',
      //   account_id: '',
      //   is_active: true,
      //   commission_on_create: '10000000000000000000000',
      //   commission_percentage: 0.1,
      //   total_commission: '0',
      // },

      this.ft[token.ticker] = {
        name: token.ticker,
        address: token.account_id,
        contract: new nearAPI.Contract(this._account, token.account_id, {
          viewMethods: ['ft_balance_of'],
          changeMethods: ['ft_transfer', 'ft_transfer_call'],
        }),
      };
    });

    // create high level api for outside usage
    this.api = NearContractApi({
      contract: this._contract,
      ft: this.ft,
      walletConnection: this._walletConnection,
      account: this._account,
      operationalCommission: this.status.operational_commission,
      tokens: this.tokensMap,
    });
    this.inited = true;
  }

  tokenMeta(ticker) {
    return this.status.tokens.find((t) => t.ticker === ticker);
  }

  isBridged(ticker) {
    const meta = this.tokenMeta(ticker);
    const bridges = ['factory.bridge.near'];

    if (bridges.some((bridge) => meta.account_id.endsWith(bridge))) {
      return true;
    }

    return false;
  }

  get tokensMap() {
    const map = {};
    this.status.tokens.forEach((token) => {
      map[token.ticker] = token;
    });
    return map;
  }
}
