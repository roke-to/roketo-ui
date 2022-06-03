import { useRoketoContext } from '~/features/legacy/roketo-context';
import { useMemo } from 'react';

import { STREAM_STATUS } from '../../api/roketo/constants';
import type { LegacyRoketoStream } from '../../api/roketo/interfaces/entities';

import { useFilter, useFilters } from './lib';

const STREAM_TYPE_FILTER = {
  ALL: 'All',
  INCOMING: 'Incoming',
  OUTGOING: 'Outgoing',
} as const;

const STREAM_STATUS_FILTER = {
  ALL: 'All',
  [STREAM_STATUS.INITIALIZED]: 'Initialized',
  [STREAM_STATUS.ACTIVE]: 'Active',
  [STREAM_STATUS.PAUSED]: 'Paused',
};

export function useStreamFilters(streams: LegacyRoketoStream[] | undefined) {
  const { auth } = useRoketoContext();

  const statusOptions = useMemo(
    () => ({
      [STREAM_STATUS_FILTER.ALL]: () => true,
      [STREAM_STATUS_FILTER[STREAM_STATUS.INITIALIZED]]: (stream: LegacyRoketoStream) => stream.status === STREAM_STATUS.INITIALIZED,
      [STREAM_STATUS_FILTER[STREAM_STATUS.ACTIVE]]: (stream: LegacyRoketoStream) => stream.status === STREAM_STATUS.ACTIVE,
      [STREAM_STATUS_FILTER[STREAM_STATUS.PAUSED]]: (stream: LegacyRoketoStream) => stream.status === STREAM_STATUS.PAUSED,
    }),
    [],
  );
  const directionOptions = useMemo(
    () => ({
      [STREAM_TYPE_FILTER.ALL]: () => true,
      [STREAM_TYPE_FILTER.INCOMING]: (stream: LegacyRoketoStream) => auth.accountId === stream.receiver_id,
      [STREAM_TYPE_FILTER.OUTGOING]: (stream: LegacyRoketoStream) => auth.accountId === stream.owner_id,
    }),
    [auth.accountId],
  );

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
