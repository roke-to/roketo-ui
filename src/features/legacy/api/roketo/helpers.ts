import {STREAM_STATUS} from './constants';
import {LegacyRoketoStream, RoketoAccount} from './interfaces/entities';

export function isIdling(stream: LegacyRoketoStream) {
  return stream.status === STREAM_STATUS.INITIALIZED || stream.status === STREAM_STATUS.PAUSED;
}

export function isDead(stream: LegacyRoketoStream) {
  return stream.status === STREAM_STATUS.FINISHED || stream.status === STREAM_STATUS.INTERRUPTED;
}

export function isActiveStream(stream: LegacyRoketoStream) {
  return stream.status === STREAM_STATUS.ACTIVE;
}

export function isPausedStream(stream: LegacyRoketoStream) {
  return stream.status === STREAM_STATUS.PAUSED;
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
