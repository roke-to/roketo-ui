import {useStoreMap} from 'effector-react';
import {useMemo} from 'react';

import {$accountId} from '~/entities/wallet';

import {STREAM_STATUS} from '~/shared/api/roketo/constants';
import type {RoketoStream} from '~/shared/api/roketo/interfaces/entities';

import {useFilter, useFilters} from './lib';

export const STREAM_TYPE_FILTER = {
  ALL: 'All',
  INCOMING: 'Incoming',
  OUTGOING: 'Outgoing',
} as const;

const STREAM_STATUS_FILTER = {
  ALL: 'All',
  [STREAM_STATUS.Initialized]: 'Initialized',
  [STREAM_STATUS.Active]: 'Active',
  [STREAM_STATUS.Paused]: 'Paused',
};

const statusOptions = {
  [STREAM_STATUS_FILTER.ALL]: () => true,
  [STREAM_STATUS_FILTER[STREAM_STATUS.Initialized]]: (stream: RoketoStream) =>
    stream.status === STREAM_STATUS.Initialized,
  [STREAM_STATUS_FILTER[STREAM_STATUS.Active]]: (stream: RoketoStream) =>
    stream.status === STREAM_STATUS.Active,
  [STREAM_STATUS_FILTER[STREAM_STATUS.Paused]]: (stream: RoketoStream) =>
    stream.status === STREAM_STATUS.Paused,
};

export function useStreamFilters(streams: RoketoStream[] | undefined) {
  const directionOptions = useStoreMap({
    store: $accountId,
    keys: [],
    fn: (accountId) => ({
      [STREAM_TYPE_FILTER.ALL]: () => true,
      [STREAM_TYPE_FILTER.INCOMING]: (stream: RoketoStream) => accountId === stream.receiver_id,
      [STREAM_TYPE_FILTER.OUTGOING]: (stream: RoketoStream) => accountId === stream.owner_id,
    }),
  });

  const statusFilter = useFilter({
    options: statusOptions,
  });

  const directionFilter = useFilter({
    options: directionOptions,
  });

  const combinedFilters = useMemo(
    () => [directionFilter, statusFilter],
    [directionFilter, statusFilter],
  );

  const result = useFilters({
    items: streams,
    filters: combinedFilters,
  });

  return {
    statusFilter,
    directionFilter,
    result,
  };
}
