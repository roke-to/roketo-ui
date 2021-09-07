import React, {useEffect} from 'react';
import classNames from 'classnames';
import {useStreamFilters} from './useStreamFilters';
import {Filter, FilterOptionWithCounter} from '../../../components/kit';

export function StreamFilters({items, onFilterDone, className}) {
  const filter = useStreamFilters(items);

  useEffect(() => {
    onFilterDone(filter.result.filteredItems);
  }, [filter.result.filteredItems, onFilterDone]);

  return (
    <div className={classNames('twind-flex', className)}>
      <Filter
        className="twind-mr-5"
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
    </div>
  );
}
