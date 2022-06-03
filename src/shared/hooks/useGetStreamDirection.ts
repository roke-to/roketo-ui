import {useStore} from 'effector-react'
import { RoketoStream } from 'shared/api/roketo/interfaces/entities';
import {$accountId} from 'services/wallet';

export const STREAM_DIRECTION = {
  IN: 'in',
  OUT: 'out',
};

type StreamDirectionKeyType = keyof typeof STREAM_DIRECTION;

export function useGetStreamDirection(stream: RoketoStream): typeof STREAM_DIRECTION[StreamDirectionKeyType] | null {
  const accountId = useStore($accountId)

  if (stream.receiver_id === accountId) {
    return STREAM_DIRECTION.IN;
  }

  if (stream.owner_id === accountId) {
    return STREAM_DIRECTION.OUT;
  }

  return null;
}
