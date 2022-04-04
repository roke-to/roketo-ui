import * as nearAPI from "near-api-js";
import { Account } from "near-api-js";

import { ROKETO_CONTRACT_NAME } from "./config";
import { RoketoContract } from './interfaces/contracts';
// import { RoketoTokenStatus, RoketoStatus } from './interfaces/entities';
import { RoketoContractApi } from "./contract-api";
import { RoketoAccount, RoketoDao } from "./interfaces/entities";

export interface Roketo {
  api: RoketoContractApi;
  dao: RoketoDao;
  account: RoketoAccount;
  // status: RoketoStatus;
  // tokenMeta: (ticker: string) => RoketoTokenStatus | undefined;
  // isBridged: (ticker: string) => boolean;
}

// const tokensToMap = (tokens: RoketoTokenStatus[]) => {
//   const map: Record<string, RoketoTokenStatus> = {};
//   tokens.forEach((token) => {
//     map[token.ticker] = token;
//   });
//   return map;
// };

export async function initRoketo({
  account,
  accountId,
}: {
  account: Account;
  accountId: string;
}): Promise<Roketo> {
  const contract = new nearAPI.Contract(account, ROKETO_CONTRACT_NAME, {
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
      // "account_deposit_near", need for unlisted tokens
      "start_stream",
      "pause_stream",
      "stop_stream",
      "withdraw",
      // "change_receiver",
    ],
  }) as RoketoContract;

  // @ts-ignore
  // await contract.account_deposit_near({}, "200000000000000", 100000000000000000000000)

  // create high level api for outside usage
  const api = new RoketoContractApi({
    contract,
    account,
    accountId,
  });

  const roketoUserAccountPromise = api.getAccount();

  const daoPromise = api.getDao();

  const incPromise = contract.get_account_incoming_streams({ account_id: accountId, from: 0, limit: 10 });
  const outPromise = contract.get_account_outgoing_streams({ account_id: accountId, from: 0, limit: 10 });
  const aftPromise = contract.get_account_ft({ account_id: accountId, token_account_id: "wrap.testnet" });
  const tknPromise = contract.get_token({ token_account_id: "wrap.testnet" });
  const stsPromise = contract.get_stats();

  const [
    roketoUserAccount,
    dao, inc, out, aft, tkn, sts,
  ] = await Promise.all([
    roketoUserAccountPromise,
    daoPromise,
    incPromise, outPromise, aftPromise, tknPromise, stsPromise,
  ]);

  console.log('get_account_incoming_streams', inc);
  console.log('get_account_outgoing_streams', out);
  console.log('get_account_ft', aft);
  console.log('get_dao', dao);
  console.log('get_token', tkn);
  console.log('get_stats', sts);
  
  return {
    api,
    dao,
    account: roketoUserAccount,
  };
}
