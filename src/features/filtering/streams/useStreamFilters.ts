import { useMemo } from 'react';
import { STREAM_STATUS, STREAM_DIRECTION } from 'shared/api/roketo/constants';

import type { RoketoStream } from 'shared/api/roketo/interfaces/entities';
import { useFilter, useFilters } from '../lib';

const STREAM_TYPE_FILTER = {
  ALL: 'All',
  INCOMING: 'Incoming',
  OUTGOING: 'Outgoing',
};

const STREAM_STATUS_FILTER = {
  ALL: 'All',
  ACTIVE: 'Active',
  PAUSED: 'Paused',
  ARCHIVED: 'Archived',
  [STREAM_STATUS.FINISHED]: 'Finished',
  [STREAM_STATUS.INTERRUPTED]: 'Interrupted',
};

export function useStreamFilters(streams: RoketoStream[] | undefined) {
  const statusOptions = useMemo(
    () => ({
      [STREAM_STATUS_FILTER.ALL]: () => true,
      [STREAM_STATUS_FILTER.ACTIVE]: (stream: RoketoStream) => stream.status === STREAM_STATUS.ACTIVE,
      [STREAM_STATUS_FILTER.PAUSED]: (stream: RoketoStream) => stream.status === STREAM_STATUS.PAUSED,
      [STREAM_STATUS_FILTER.ARCHIVED]: (stream: RoketoStream) => stream.status === STREAM_STATUS.ARCHIVED,
      [STREAM_STATUS_FILTER[STREAM_STATUS.INTERRUPTED]]:
        (stream: RoketoStream) => stream.status === STREAM_STATUS.INTERRUPTED,
      [STREAM_STATUS_FILTER[STREAM_STATUS.FINISHED]]:
        (stream: RoketoStream) => stream.status === STREAM_STATUS.FINISHED,
    }),
    [],
  );
  const directionOptions = useMemo(
    () => ({
      [STREAM_TYPE_FILTER.ALL]: () => true,
      [STREAM_TYPE_FILTER.INCOMING]: (stream: RoketoStream) => STREAM_DIRECTION.IN === stream.direction,
      [STREAM_TYPE_FILTER.OUTGOING]: (stream: RoketoStream) => STREAM_DIRECTION.OUT === stream.direction,
    }),
    [],
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
