import {useMemo} from 'react';
import {useFilter, useFilters} from '../lib';

const STREAM_STATUS = {
  ARCHIVED: 'ARCHIVED',
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
};
const STREAM_DIRECTION = {
  IN: 'in',
  OUT: 'out',
};
const STREAM_TYPE_FILTER = {
  ALL: 'All',
  INCOMING: 'Incoming',
  OUTGOING: 'Outgoing',
};

const STREAM_STATUS_FILTER = {
  ALL: 'All',
  ACTIVE: 'Active',
  ARCHIVED: 'Archived',
};

export function useStreamFilters(streams) {
  const statusOptions = useMemo(
    () => ({
      [STREAM_STATUS_FILTER.ALL]: () => true,
      [STREAM_STATUS_FILTER.ACTIVE]: (stream) =>
        stream.status === STREAM_STATUS.ACTIVE,
      [STREAM_STATUS_FILTER.ARCHIVED]: (stream) =>
        stream.status === STREAM_STATUS.ARCHIVED,
    }),
    [],
  );
  const directionOptions = useMemo(
    () => ({
      [STREAM_TYPE_FILTER.ALL]: () => true,
      [STREAM_TYPE_FILTER.INCOMING]: (stream) =>
        STREAM_DIRECTION.IN === stream.direction,
      [STREAM_TYPE_FILTER.OUTGOING]: (stream) =>
        STREAM_DIRECTION.OUT === stream.direction,
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
    () => [directionFilter, statusFilter, directionFilter],
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
