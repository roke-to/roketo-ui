import {getStreamDirection} from '@roketo/sdk';
import type {RoketoStream} from '@roketo/sdk/dist/types';
import {useStore} from 'effector-react';

import {$accountId} from '~/entities/wallet';

export function useGetStreamDirection(stream: RoketoStream) {
  const accountId = useStore($accountId);
  return getStreamDirection(stream, accountId);
}
