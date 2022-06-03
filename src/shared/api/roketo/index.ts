import * as nearAPI from "near-api-js";
import { Account } from "near-api-js";

import { env } from "~/shared/config";

import { RoketoContract } from './interfaces/contracts';
import { RoketoContractApi } from "./contract-api";
import { RoketoAccount, RoketoDao } from "./interfaces/entities";

export interface Roketo {
  api: RoketoContractApi;
  dao: RoketoDao;
  account: RoketoAccount;
}

export async function initRoketo({
  account,
}: {
  account: Account;
}): Promise<Roketo> {
  const contract = new nearAPI.Contract(account, env.ROKETO_CONTRACT_NAME, {
    viewMethods: [
      "get_stats",
      "get_dao",
      "get_token",
      "get_stream",
      "get_account",
      "get_account_incoming_streams",
      "get_account_outgoing_streams",
      "get_account_ft",
    ],
    changeMethods: [
      "start_stream",
      "pause_stream",
      "stop_stream",
      "withdraw",
    ],
  }) as RoketoContract;

  // create high level api for outside usage
  const api = new RoketoContractApi({
    contract,
    account,
  });

  const roketoUserAccountPromise = api.getAccount();

  const daoPromise = api.getDao();

  const [
    roketoUserAccount,
    dao
  ] = await Promise.all([
    roketoUserAccountPromise,
    daoPromise,
  ]);

  return {
    api,
    dao,
    account: roketoUserAccount,
  };
}
