// it's a number represented by string
type StringInt = string;

/**
 * `[0]`: Ticker of the token
 * `[1]`: Int amount of tokens (it maybe sum or speed per tick)
 */
type TokenAmount = [string, StringInt];

/**
 *  Divide it by 1e6 to receive JS milliseconds timestamp
 */
type NanosecondsTimestamp = string;

/**
 * `INITIALIZED` - stream has been created, but not started, happens if "auto-start" is set to false when stream created
 * `ACTIVE` - stream is all set and money is flowing
 * `PAUSED` - stream has been set to pause, it may be started again any time
 * `FINISHED` - Finalized Status. stream has streamed all it's balance and account has been updated.
 * `INTERRUPTED` - Finalized Status. Stream has been stopped
 */
export type StreamStatus =
  | "INITIALIZED"
  | "ACTIVE"
  | "PAUSED"
  | "FINISHED"
  | "INTERRUPTED";

/**
 *
 * `id` - Stream unique id
 * `description` - Custom data sent along with the stream
 * `owner_id` - Account id of stream sender
 * `receiver_id` - Account id of stream receiver
 * `ticker` - Token ticker, NEAR or one of whitelisted tokens
 * `balance` - Tokens that are not withdrawn, tho they can be already streamed
 * `tokens_per_tick` - Streaming speed, refer to helpers.ts to learn how to convert it
 * `auto_deposit_enabled` - If stream should be auto-deposited using your existing incoming streams
 * `status` - Stream status
 * `available_to_withdraw` - amount which will be transferred to user account after withdraw
 *
 */
export type RoketoStream = {
  id: string;
  description: string;
  owner_id: string;
  receiver_id: string;
  ticker: string;
  timestamp_created: NanosecondsTimestamp;
  balance: StringInt;
  tokens_per_tick: StringInt;
  auto_deposit_enabled: false;
  status: StreamStatus;
  tokens_total_withdrawn: StringInt;
  available_to_withdraw: StringInt;
  history_len: 8;
};

/**
 * `account_id` - account name in NEAR blockchain
 * `dynamic_inputs` - ID's of incoming streams that may change (not finalized state)
 * `dynamic_outputs` - ID's of OUTGOING streams that may change (not finalized state)
 * `static_streams` - Finalized streams - they will not change!
 * `last_action`- Timestamp of last account update, use it to calculate available balances. `null` - if account was never updated (it's a new account)
 * `ready_to_withdraw` - Convenient way to get current withdrawable balance
 * `total_incoming` - All OUTGOING tokens listed there with their speed-per-tick
 * `total_received` - Total amounts that has been streamed to an account
 * `is_external_update_enabled` - True if "update_account" method allowed to be called not by account owner
 */
export type RoketoAccount = {
  account_id: string;
  dynamic_inputs: string[];
  dynamic_outputs: string[];
  static_streams: string[];
  last_action: NanosecondsTimestamp | null;
  ready_to_withdraw: TokenAmount[];
  total_incoming: TokenAmount[];
  total_outgoing: TokenAmount[];
  total_received: TokenAmount[];
  is_external_update_enabled: boolean;
};

/**
 * `account_id` - FT token address, empty string for NEAR
 * `is_active` - true if token is working fine
 * `commission_on_create` - Commission in token used to create stream
 * `commission_percentage` - Charged on withdraw
 */
export type RoketoTokenStatus = {
  name: string;
  ticker: string;
  account_id: string;
  is_active: boolean;
  commission_on_create: StringInt;
  commission_percentage: number;
  total_commission: string;
};

/**
 * `dao_id` - Contract id of Roketo DAO
 * `num_tokens_listed` - Amount of whitelisted tokens
 * `operational_commission` - Commission for operation in NEAR. Required as deposit for those methods: `updateAccount`, `changeAutoDeposit`, `pauseStream`, `startStream`, `stopStream`
 * `tokens` - data for specific token
 */
export type RoketoStatus = {
  dao_id: string;
  num_tokens_listed: number;
  operational_commission: StringInt;
  tokens: RoketoTokenStatus[];
};

type StreamActionType =
  | "Init"
  | "Deposit"
  | "Start"
  | "Withdraw"
  | "Pause"
  | "Stop";

/**
 * `actor` - Account id who triggered action
 * `amount` - Int for `Deposit` action, `null` for others
 * `commission_on_withdraw` - Int for `Withdraw` action, `null` for others
 */
export type StreamAction = {
  actor: string;
  action_type: StreamActionType;
  amount: StringInt | null;
  commission_on_withdraw: StringInt | null;
  timestamp: NanosecondsTimestamp;
};