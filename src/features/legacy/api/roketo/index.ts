import * as nearAPI from 'near-api-js';
import {Contract, WalletConnection} from 'near-api-js';

import {
  CONTRACT_CHANGE_METHODS as NEAR_CHANGE_METHODS,
  CONTRACT_VIEW_METHODS as NEAR_VIEW_METHODS,
} from '../near/constants';

import {ROKETO_CONTRACT_NAME} from './config';
import {RoketoContract} from './interfaces/contracts';
import {RoketoApi} from './interfaces/roketo-api';
import {RoketoStatus, RoketoTokenStatus} from './interfaces/entities';
import {RoketoContractApi} from './contract-api';
import {
  NEAR_BRIDGE,
  CONTRACT_CHANGE_METHODS as ROKETO_CHANGE_METHODS,
  CONTRACT_VIEW_METHODS as ROKETO_VIEW_METHODS,
} from './constants';

export interface Roketo {
  api: RoketoApi;
  status: RoketoStatus;
  tokenMeta: (ticker: string) => RoketoTokenStatus | undefined;
  isBridged: (ticker: string) => boolean;
}

const tokensToMap = (tokens: RoketoTokenStatus[]) => {
  const map: Record<string, RoketoTokenStatus> = {};
  tokens.forEach((token) => {
    map[token.ticker] = token;
  });
  return map;
};

export async function initRoketo({
  walletConnection,
}: {
  walletConnection: WalletConnection;
}): Promise<Roketo> {
  const account = await walletConnection.account();

  if (!ROKETO_CONTRACT_NAME) {
    throw new Error('ROKETO_CONTRACT_NAME should have a value.');
  }

  const contract = new nearAPI.Contract(account, ROKETO_CONTRACT_NAME, {
    viewMethods: ROKETO_VIEW_METHODS,
    changeMethods: ROKETO_CHANGE_METHODS,
  }) as RoketoContract;

  const status = await contract.get_status({});
  const ft: Record<
    string,
    {
      name: string;
      address: string;
      contract: Contract;
    }
  > = {};

  const tokensMap = tokensToMap(status.tokens);

  status.tokens.forEach((token) => {
    ft[token.ticker] = {
      name: token.ticker,
      address: token.account_id,
      contract: new nearAPI.Contract(account, token.account_id, {
        viewMethods: NEAR_VIEW_METHODS,
        changeMethods: NEAR_CHANGE_METHODS,
      }),
    };
  });

  // create high level api for outside usage
  const api = RoketoContractApi({
    contract,
    ft,
    walletConnection,
    account,
    operationalCommission: status.operational_commission,
    tokens: tokensMap,
  });

  const tokenMeta = (ticker: string) => status.tokens.find((t) => t.ticker === ticker);

  const isBridged = (ticker: string) => {
    const meta = tokenMeta(ticker);

    return Boolean(meta?.account_id.endsWith(NEAR_BRIDGE));
  };

  return {
    api,
    status,
    tokenMeta,
    isBridged,
  };
}
