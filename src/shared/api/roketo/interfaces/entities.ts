// it's a number represented by string
type StringInt = string;

type StreamId = string;
type AccountId = string;

type SafeFloat = { val: number, pow: number };

export type StreamStatus =
  | "Initialized" // stream has been created, but not started, happens if "auto-start" is set to false when stream created
  | "Active"      // stream is all set and money is flowing
  | "Paused"      // stream has been set to pause, it may be started again any time
  | "Finished";   // stream has streamed all it's balance and account has been updated.

export type RoketoStream = {
  amount_to_push: StringInt;
  balance: StringInt; // Tokens that are not withdrawn, tho they can be already streamed
  cliff?: StringInt;
  creator_id: AccountId;
  description: string; // Custom data sent along with the stream
  id: StreamId; // Stream unique id
  is_expirable: boolean;
  is_locked: boolean;
  last_action: number;
  owner_id: AccountId; // Account id of stream sender
  receiver_id: AccountId; // Account id of stream receiver
  status: StreamStatus; // Stream status
  timestamp_created: number;
  token_account_id: AccountId;
  tokens_per_sec: StringInt; // Streaming speed, refer to helpers.ts to learn how to convert it
  tokens_total_withdrawn: StringInt;
};

type TokenAmmount = {
  [tokenAccountId: string]: StringInt;
}

export type RoketoAccount = {
  active_incoming_streams: number;
  active_outgoing_streams: number;
  deposit: StringInt;
  inactive_incoming_streams: number;
  inactive_outgoing_streams: number;
  is_cron_allowed: boolean; // TODO
  last_created_stream: StreamId;
  stake: StringInt; // TODO
  total_incoming: TokenAmmount;
  total_outgoing: TokenAmmount;
  total_received: TokenAmmount;
};

// Then we list token we keep some information on roketo contract side
export type RoketoTokenMeta = {
  account_id: AccountId;
  collected_commission: StringInt;
  commission_coef: SafeFloat;
  commission_on_create: StringInt;
  gas_for_ft_transfer: StringInt;
  gas_for_storage_deposit: StringInt;
  is_listed: boolean;
  storage_balance_needed: StringInt;
};

// Also we can name it "roketo contract settings"
export type RoketoDao = {
  commission_unlisted: StringInt;
  dao_id: AccountId;
  eth_near_ratio: SafeFloat;
  oracles: []; // TODO
  tokens: { [tokenAccountId: string]: RoketoTokenMeta }
  utility_token_decimals: number;
  utility_token_id: AccountId;
};

// Some token stats on roketo contract side
export type RoketoTokenStats = {
  active_streams: number;
  last_update_time: number;
  refunded: StringInt;
  streams: number;
  total_commission_collected: StringInt;
  total_deposit: StringInt;
  transferred: StringInt
  tvl: StringInt;
};

// all contract stats
export type RoketoStats = {
  dao_tokens: { [tokenAccountId: string]: RoketoTokenStats }
  last_update_time: number;
  total_account_deposit_eth: StringInt;
  total_account_deposit_near: StringInt;
  total_accounts: number;
  total_active_streams: number;
  total_aurora_streams: number
  total_dao_tokens: number;
  total_streams: number;
  total_streams_unlisted: number
};

export type RoketoCreateRequest = {
    description: string;
    owner_id: string;
    receiver_id: string;
    balance: string;
    tokens_per_sec: BigInt;
    cliff_period_sec?: string;
    is_auto_start_enabled?: boolean;
    is_expirable?: boolean;
    is_locked?: boolean;
}