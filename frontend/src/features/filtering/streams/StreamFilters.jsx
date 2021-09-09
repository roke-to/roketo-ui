import React, {useEffect, useState} from 'react';
import classNames from 'classnames';
import {useStreamFilters} from './useStreamFilters';
import {Filter, FilterOptionWithCounter} from '../../../components/kit';

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
};
export function StreamFilters({items, onFilterDone, className}) {
  const filter = useStreamFilters(items);
  const [sorting, setSorting] = useState(sorts.highSpeedFirst);
  const sortOptions = Object.values(sorts);

  useEffect(() => {
    const sorted = [...filter.result.filteredItems];
    sorted.sort(sorting.fn);

    onFilterDone(sorted);
  }, [filter.result.filteredItems, onFilterDone, sorting.fn]);

  return (
    <div className={classNames('md:twind-flex', className)}>
      <Filter
        className="twind-mr-5 twind-z-10"
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
        className="twind-z-10"
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
      <div className="twind-flex-grow"></div>
      <Filter
        className="twind-mt-3 md:twind-mt-0"
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
