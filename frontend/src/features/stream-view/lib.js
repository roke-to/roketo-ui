import { STREAM_STATUS } from '../stream-control/lib';

export function streamDirection({ stream, account }) {
  if (!account) return '';

  if (stream.owner_id === account.account_id) {
    return 'out';
  } if (stream.receiver_id === account.account_id) {
    return 'in';
  }
  return '';
}

export function isIdling(stream) {
  return (
    stream.status === STREAM_STATUS.INITIALIZED
    || stream.status === STREAM_STATUS.PAUSED
  );
}

export function isDead(stream) {
  return (
    stream.status === STREAM_STATUS.FINISHED
    || stream.status === STREAM_STATUS.INTERRUPTED
  );
}

export function isFundable(stream) {
  return stream.available_to_withdraw !== stream.balance;
}
