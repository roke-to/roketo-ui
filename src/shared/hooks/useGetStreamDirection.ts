import { RoketoStream } from 'shared/api/roketo/interfaces/entities';
import { useRoketoContext } from 'app/roketo-context';

export const STREAM_DIRECTION = {
  IN: 'in',
  OUT: 'out',
};

type StreamDirectionKeyType = keyof typeof STREAM_DIRECTION;

export function useGetStreamDirection(stream: RoketoStream): typeof STREAM_DIRECTION[StreamDirectionKeyType] {
  const { auth } = useRoketoContext();

  return stream.receiver_id === auth.accountId
    ? STREAM_DIRECTION.IN
    : STREAM_DIRECTION.OUT;
}