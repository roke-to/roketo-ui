import { RoketoStream } from 'shared/api/roketo/interfaces/entities';
import { useRoketoContext } from 'app/roketo-context';

export const STREAM_DIRECTION = {
  IN: 'in',
  OUT: 'out',
};

type StreamDirectionKeyType = keyof typeof STREAM_DIRECTION;

export function useGetStreamDirection(stream: RoketoStream): typeof STREAM_DIRECTION[StreamDirectionKeyType] | null {
  const { auth } = useRoketoContext();

  if (stream.receiver_id === auth.accountId) {
    return STREAM_DIRECTION.IN;
  }

  if (stream.owner_id === auth.accountId) {
    return STREAM_DIRECTION.OUT;
  }

  return null;
}
