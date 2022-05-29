import { STREAM_STATUS } from './constants';
import { LegacyRoketoStream, RoketoAccount } from './interfaces/entities';

type StreamDirectionProps = {
  stream: LegacyRoketoStream;
  account: RoketoAccount;
}

export function streamDirection({ stream, account }: StreamDirectionProps): LegacyRoketoStream["direction"] {
  if (!account) return null;

  if (stream.owner_id === account.account_id) {
    return 'out';
  } if (stream.receiver_id === account.account_id) {
    return 'in';
  }
  return null;
}

export function isIdling(stream: LegacyRoketoStream) {
  return (
    stream.status === STREAM_STATUS.INITIALIZED
    || stream.status === STREAM_STATUS.PAUSED
  );
}

export function isDead(stream: LegacyRoketoStream) {
  return (
    stream.status === STREAM_STATUS.FINISHED
    || stream.status === STREAM_STATUS.INTERRUPTED
  );
}

export function isActiveStream(stream: LegacyRoketoStream) {
  return (
    stream.status === STREAM_STATUS.ACTIVE
  );
}

export function isPausedStream(stream: LegacyRoketoStream) {
  return (
    stream.status === STREAM_STATUS.PAUSED
  );
}

export const getEmptyAccount = (id: string = 'any'): RoketoAccount => ({
  account_id: id,
  dynamic_inputs: [],
  dynamic_outputs: [],
  static_streams: [],
  last_action: null,
  ready_to_withdraw: [],
  total_incoming: [],
  total_outgoing: [],
  total_received: [],
  is_external_update_enabled: false,
  cron_task: null,
});

export const getEmptyStream = (id: string = 'any'): LegacyRoketoStream => ({
  ticker: 'NEAR',
  history_len: 8,
  id,
  description: 'test stream',
  owner_id: 'kpr.testnet',
  receiver_id: 'pinkinice.testnet',
  timestamp_created: '1630964802206727665',
  balance: '3472735225910300000000000',
  tokens_per_tick: '100000000000',
  status: 'ACTIVE',
  tokens_total_withdrawn: '27264774089700000000000',
  available_to_withdraw: '3472735225910300000000000',
  direction: null,
})
