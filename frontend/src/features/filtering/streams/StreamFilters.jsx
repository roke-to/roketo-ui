import React, {useEffect, useState} from 'react';
import classNames from 'classnames';
import {useStreamFilters} from './useStreamFilters';
import {Filter, FilterOptionWithCounter} from '../../../components/kit/Filter';
import {STREAM_STATUS} from '../../stream-control/lib';

function compareBy(a, b, key) {
  if (Number(a[key]) > Number(b[key])) {
    return -1;
  } else if (Number(a[key]) < Number(b[key])) {
    return 1;
  } else {
    return 0;
  }
}

const sorts = {
  bigBalanceFirst: {
    label: 'With big balances',
    fn: (a, b) => compareBy(a, b, 'balance'),
  },
  highSpeedFirst: {
    label: 'With high speed',
    fn: (a, b) => compareBy(a, b, 'tokens_per_tick'),
  },
  highSpeedLast: {
    label: 'With low speed',
    fn: (a, b) => compareBy(a, b, 'tokens_per_tick') * -1,
  },
  mostRecent: {
    label: 'Most recent',
    fn: (a, b) => compareBy(a, b, 'timestamp_created'),
  },
};
const statusPriority = [
  STREAM_STATUS.INITIALIZED,
  STREAM_STATUS.ACTIVE,
  STREAM_STATUS.PAUSED,
  STREAM_STATUS.INTERRUPTED,
  STREAM_STATUS.FINISHED,
];
function defaultStreamSort(a, b) {
  return statusPriority.indexOf(a.status) - statusPriority.indexOf(b.status);
}

export function StreamFilters({items, onFilterDone, className}) {
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
      <div className="flex-grow"></div>
      <Filter
        className="mt-3 md:mt-0"
        minimal
        options={sortOptions}
        label="Show first:"
        active={sorting}
        onChange={setSorting}
        renderOption={(option) => {
          return <span>{option.label}</span>;
        }}
        renderActive={(option) => {
          return <span>{option.label}</span>;
        }}
      />
    </div>
  );
}
