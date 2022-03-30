import { Contract } from 'near-api-js';
import {
  RoketoAccount,
  RoketoStream,
  RoketoDao,
  RoketoTokenStats,
  RoketoTokenMeta,
  RoketoStats,
} from './entities';

type ContractChangeFunctionArgs<P> = {
  args: P;
  gas: string;
  amount: string;
  callbackUrl?: string;
};

type ContractResponse<R> = {
  Err: never;
  Ok: R;
}

type ContractViewFunction<P, R> = (json?: P) => Promise<R>;
type ContractChangeFunction<P> = (
  json: P | ContractChangeFunctionArgs<P>,
  gasSize?: string,
  deposit?: string
) => Promise<void>;

type StreamsProps = { account_id: string, from: number, limit: number };
type AccountFTResponse = [ total_incoming: string, total_outgoing: string, total_received: string ];

export type RoketoContract = Contract & {
  // View
  get_account: ContractViewFunction<{ account_id: string }, ContractResponse<RoketoAccount>>;
  get_stream: ContractViewFunction<{ stream_id: string }, ContractResponse<RoketoStream>>;
  get_account_incoming_streams: ContractViewFunction<StreamsProps, ContractResponse<RoketoStream[]>>;
  get_account_outgoing_streams: ContractViewFunction<StreamsProps, ContractResponse<RoketoStream[]>>;
  get_account_ft: ContractViewFunction<{ account_id: string, token_account_id: string }, ContractResponse<AccountFTResponse>>;
  get_dao: ContractViewFunction<{}, RoketoDao>;
  get_token: ContractViewFunction<{ token_account_id: string }, [ RoketoTokenMeta, RoketoTokenStats ]>;
  get_stats: ContractViewFunction<{}, RoketoStats>;

  // Change
  // create_stream: ContractChangeFunction<{
  //   description: string;
  //   creator_id: string;
  //   owner_id: string;
  //   receiver_id: string;
  //   token_account_id: string;
  //   initial_balance: number;
  //   tokens_per_sec: number;
  //   cliff_period_sec: string;
  //   is_auto_start_enabled: boolean;
  //   is_expirable: boolean;
  //   is_locked: boolean;
  // }>;
  withdraw: ContractChangeFunction<{ stream_ids: string[] }>;
  start_stream: ContractChangeFunction<{ stream_id: string }>;
  pause_stream: ContractChangeFunction<{ stream_id: string }>;
  stop_stream: ContractChangeFunction<{ stream_id: string }>;
};
