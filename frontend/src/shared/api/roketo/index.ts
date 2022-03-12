import * as nearAPI from "near-api-js";
import { Contract, WalletConnection } from "near-api-js";

import { ROKETO_CONTRACT_NAME } from "./config";
import { RoketoContract } from './interfaces/contracts';
import { RoketoApi } from './interfaces/roketo-api';
import { RoketoTokenStatus, RoketoStatus } from './interfaces/entities';
import { RoketoContractApi } from "./contract-api";

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
  const contract = new nearAPI.Contract(account, ROKETO_CONTRACT_NAME, {
    viewMethods: [
      "get_account",
      "get_stream",
      "get_stream_history",
      "get_status",
    ],
    changeMethods: [
      "create_stream",
      "deposit",
      "update_account",
      "start_stream",
      "pause_stream",
      "stop_stream",
      "change_auto_deposit",
      "start_cron",
    ],
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
        viewMethods: ["ft_balance_of"],
        changeMethods: ["ft_transfer", "ft_transfer_call"],
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

  const tokenMeta = (ticker: string) => status.tokens.find((t) => t.ticker === ticker);;

  const isBridged = (ticker: string) => {
    const meta = tokenMeta(ticker);
    const bridges = ["factory.bridge.near"];

    if (meta && bridges.some((bridge) => meta.account_id.endsWith(bridge))) {
      return true;
    }

    return false;
  };

  return {
    api,
    status,
    tokenMeta,
    isBridged,
  };
}