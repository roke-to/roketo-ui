import BigNumber from 'bignumber.js';
import { millisecondsToSeconds } from 'date-fns';

import { fromNanosecToSec } from 'shared/helpers/date';

import { STREAM_STATUS } from './constants';
import { RoketoStream, RoketoAccount } from './interfaces/entities';

export function isIdling(stream: RoketoStream) {
  return (
    stream.status === STREAM_STATUS.Initialized
    || stream.status === STREAM_STATUS.Paused
  );
}

export function isDead(stream?: RoketoStream) {
  return typeof stream?.status === 'object' && STREAM_STATUS.Finished in stream.status;
}

export function getAvailableToWithdraw(stream: RoketoStream): BigNumber {
  const nowSec = millisecondsToSeconds(Date.now());
  const lastActionSec = fromNanosecToSec(stream.last_action);
  const period = nowSec - lastActionSec;

  return BigNumber.minimum(
    stream.balance, 
    Number(stream.tokens_per_sec) * period
  );
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
