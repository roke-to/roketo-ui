import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { Filter, FilterOptionWithCounter } from 'shared/kit/Filter';
import { STREAM_STATUS } from 'shared/api/roketo/constants';
import type { RoketoStream } from 'shared/api/roketo/interfaces/entities';

import { useStreamFilters } from './useStreamFilters';

function compareBy(a: RoketoStream, b: RoketoStream, key: keyof RoketoStream) {
  return Number(b[key]) - Number(a[key]);
}

const sorts = {
  bigBalanceFirst: {
    label: 'With big balances',
    fn: (a: RoketoStream, b: RoketoStream) => compareBy(a, b, 'balance'),
  },
  highSpeedFirst: {
    label: 'With high speed',
    fn: (a: RoketoStream, b: RoketoStream) => compareBy(a, b, 'tokens_per_sec'),
  },
  highSpeedLast: {
    label: 'With low speed',
    fn: (a: RoketoStream, b: RoketoStream) => compareBy(a, b, 'tokens_per_sec') * -1,
  },
  mostRecent: {
    label: 'Most recent',
    fn: (a: RoketoStream, b: RoketoStream) => compareBy(a, b, 'timestamp_created'),
  },
};
const statusPriority = [
  STREAM_STATUS.Initialized,
  STREAM_STATUS.Active,
  STREAM_STATUS.Paused,
  STREAM_STATUS.Finished,
];
function defaultStreamSort(a: RoketoStream, b: RoketoStream) {
  return statusPriority.indexOf(a.status) - statusPriority.indexOf(b.status);
}

type StreamFiltersProps = {
  items: RoketoStream[];
  onFilterDone: (result: RoketoStream[]) => void;
  className: string;
};

export function StreamFilters({ items, onFilterDone, className }: StreamFiltersProps) {
  const filter = useStreamFilters(items);
  const [sorting, setSorting] = useState(sorts.mostRecent);
  const sortOptions = Object.values(sorts);

  useEffect(() => {
    const sorted = [...filter.result.filteredItems];
    sorted.sort(defaultStreamSort);
    sorted.sort(sorting.fn);
    onFilterDone(sorted);
  }, [filter.result.filteredItems, onFilterDone, sorting.fn]);

  return (
    <div className={classNames('md:flex', className)}>
      <Filter
        className="mr-5 z-10"
        options={filter.directionFilter.optionsArray}
        label="Type:"
        active={filter.directionFilter.option}
        onChange={filter.directionFilter.selectOption}
        renderOption={(option) => {
          const counts = filter.result.filterCounts[0];
          return (
            <FilterOptionWithCounter
              option={option}
              count={counts ? counts[option] : ''}
            />
          );
        }}
      />
      <Filter
        className="z-10"
        options={filter.statusFilter.optionsArray}
        label="Status:"
        active={filter.statusFilter.option}
        onChange={filter.statusFilter.selectOption}
        renderOption={(option) => {
          const counts = filter.result.filterCounts[1];
          return (
            <FilterOptionWithCounter
              option={option}
              count={counts ? counts[option] : ''}
            />
          );
        }}
      />
      <div className="flex-grow" />
      <Filter
        className="mt-3 md:mt-0"
        minimal
        options={sortOptions}
        label="Show first:"
        active={sorting}
        onChange={setSorting}
        renderOption={(option) => <span>{option.label}</span>}
        renderActive={(option) => <span>{option.label}</span>}
      />
    </div>
  );
}
