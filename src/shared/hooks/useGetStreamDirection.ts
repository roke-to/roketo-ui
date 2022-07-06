import {useStore} from 'effector-react';

import {$accountId} from '~/entities/wallet';

import type {RoketoStream} from '~/shared/api/roketo/interfaces/entities';
import {getStreamDirection} from '~/shared/api/roketo/lib';

export function useGetStreamDirection(stream: RoketoStream) {
  const accountId = useStore($accountId);
  return getStreamDirection(stream, accountId);
}
