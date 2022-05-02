import React, { useEffect, useState } from 'react';
import classNames from 'classnames';

import {SortIcon, OrderType} from '@ui/icons/Sort';

import { Filter, FilterOptionWithCounter } from 'shared/kit/Filter';
import type { RoketoStream } from 'shared/api/roketo/interfaces/entities';

import {DirectionSorts} from '../DirectionSorts';
import { useStreamFilters } from '../useStreamFilters';

import styles from './styles.module.scss';

function compareBy(a: RoketoStream, b: RoketoStream, key: keyof RoketoStream) {
  return Number(b[key]) - Number(a[key]);
}

const sorts = {
  bigBalanceFirst: {
    label: 'With big balances',
    order: OrderType.desc,
    fn: (a: RoketoStream, b: RoketoStream) => compareBy(a, b, 'balance'),
  },
  highSpeedFirst: {
    label: 'With high speed',
    order: OrderType.desc,
    fn: (a: RoketoStream, b: RoketoStream) => compareBy(a, b, 'tokens_per_sec'),
  },
  highSpeedLast: {
    label: 'With low speed',
    order: OrderType.asc,
    fn: (a: RoketoStream, b: RoketoStream) => compareBy(a, b, 'tokens_per_sec') * -1,
  },
  mostRecent: {
    label: 'Most recent',
    order: OrderType.desc,
    fn: (a: RoketoStream, b: RoketoStream) => compareBy(a, b, 'timestamp_created'),
  },
};

type StreamFiltersProps = {
  items: RoketoStream[] | undefined;
  onFilterDone: (result: RoketoStream[] | undefined) => void;
  className?: string;
};

export function StreamFilters({ items, onFilterDone, className }: StreamFiltersProps) {
  const filter = useStreamFilters(items);
  const {filteredItems} = filter.result;

  const [sorting, setSorting] = useState(sorts.mostRecent);
  const sortOptions = Object.values(sorts);

  useEffect(() => {
    if (!filteredItems) {
      onFilterDone(filteredItems);

      return;
    }

    const sortedStreams = [...filteredItems];

    sortedStreams.sort(sorting.fn);

    onFilterDone(sortedStreams);
  }, [filteredItems, onFilterDone, sorting.fn]);

  return (
    <div className={classNames('md:flex', className)}>
      <DirectionSorts
        directions={filter.directionFilter.optionsArray}
        activeDirection={filter.directionFilter.option}
        onDirectionClick={filter.directionFilter.selectOption}
      />

      <div className="flex-grow" />

      <div className={styles.filtersWrapper}>
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

        <Filter
          options={sortOptions}
          label="Show first:"
          active={sorting}
          onChange={setSorting}
          renderOption={(option) => <span>{option.label}</span>}
          renderActive={(option) => (
            <div className={styles.sortWithOrder}>
              {option.order && <SortIcon type={option.order} />}
              <span>{option.label}</span>
            </div>
          )}
        />
      </div>
    </div>
  );
}
