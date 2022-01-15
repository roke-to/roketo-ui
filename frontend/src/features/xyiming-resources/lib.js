import {STREAM_DIRECTION} from '../stream-control/lib';

export function identifyStreamsDirection(streams, accountId) {
  return streams.map((stream) => {
    return {
      ...stream,
      direction:
        stream.owner_id === accountId
          ? STREAM_DIRECTION.OUT
          : stream.receiver_id === accountId
          ? STREAM_DIRECTION.IN
          : null,
    };
  });
}
