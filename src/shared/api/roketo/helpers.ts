import { STREAM_STATUS } from './constants';
import { RoketoStream, RoketoAccount } from './interfaces/entities';

type StreamDirectionProps = {
  stream: RoketoStream;
  account: RoketoAccount;
}

export function streamDirection({ stream, account }: StreamDirectionProps): string | null {
  if (!account) return null;
  console.log('stream', stream)

  // if (stream.owner_id === account.account_id) {
  //   return 'out';
  // } if (stream.receiver_id === account.account_id) {
  //   return 'in';
  // }
  return null;
}

export function isIdling(stream: RoketoStream) {
  return (
    stream.status === STREAM_STATUS.Initialized
    || stream.status === STREAM_STATUS.Paused
  );
}

export function isDead(stream?: RoketoStream) {
  return stream?.status === STREAM_STATUS.Finished;
}

export function isFundable(stream: RoketoStream) {
  return stream.tokens_total_withdrawn !== stream.balance;
}

export const getEmptyAccount = (): RoketoAccount => ({
  active_incoming_streams: 0,
  active_outgoing_streams: 0,
  deposit: "0",
  inactive_incoming_streams: 0,
  inactive_outgoing_streams: 0,
  is_cron_allowed: true,
  last_created_stream: "any",
  stake: "0",
  total_incoming: {},
  total_outgoing: {},
  total_received: {}
});

export const getEmptyStream = (id: string = 'any'): RoketoStream => ({
  amount_to_push: "1250000000000000000000",
  balance: "1249999999999999990000",
  creator_id: "dcversus.testnet",
  description: "lol",
  id,
  is_expirable: true,
  is_locked: false,
  last_action: 1648397477757220400,
  owner_id: "dcversus.testnet",
  receiver_id: "dcversus2.testnet",
  status: "Active",
  timestamp_created: 1648397477757220400,
  token_account_id: "wrap.testnet",
  tokens_per_sec: "1111111111111",
  tokens_total_withdrawn: "0",
})
