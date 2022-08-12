import {getStreamDirection} from '@roketo/sdk';
import {useStore} from 'effector-react';

import {$accountId} from '~/entities/wallet';

import type {RoketoStream} from '~/shared/api/roketo/interfaces/entities';

export function useGetStreamDirection(stream: RoketoStream) {
  const accountId = useStore($accountId);
  return getStreamDirection(stream, accountId);
}
