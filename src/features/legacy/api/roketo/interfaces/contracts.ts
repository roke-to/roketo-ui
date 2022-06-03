import {Contract} from 'near-api-js';

import {RoketoAccount, RoketoStatus, LegacyRoketoStream, StreamAction} from './entities';

type ContractChangeFunctionArgs<P> = {
  args: P;
  gas: string;
  amount: string;
  callbackUrl?: string;
};

type ContractViewFunction<P, R> = (json: P) => Promise<R>;
type ContractChangeFunction<P> = (
  json: P | ContractChangeFunctionArgs<P>,
  gasSize?: string,
  deposit?: string,
) => Promise<void>;

export type RoketoContract = Contract & {
  // View
  get_account: ContractViewFunction<{account_id: string}, RoketoAccount>;
  get_stream: ContractViewFunction<{stream_id: string}, LegacyRoketoStream>;
  get_stream_history: ContractViewFunction<
    {stream_id: string; from: number; to: number},
    StreamAction[]
  >;
  get_status: ContractViewFunction<{}, RoketoStatus>;
  // Change
  create_stream: ContractChangeFunction<{
    owner_id: string;
    receiver_id: string;
    token_name: string;
    tokens_per_tick: string;
    description: string;
    is_auto_deposit_enabled: boolean; // TODO: Remove after switching to contract v2
    is_auto_start_enabled: boolean;
  }>;

  deposit: ContractChangeFunction<{stream_id: string}>;
  update_account: ContractChangeFunction<{account_id: string}>;
  start_stream: ContractChangeFunction<{stream_id: string}>;
  pause_stream: ContractChangeFunction<{stream_id: string}>;
  stop_stream: ContractChangeFunction<{stream_id: string}>;
  change_auto_deposit: ContractChangeFunction<{
    stream_id: string;
    auto_deposit: boolean;
  }>;
};
