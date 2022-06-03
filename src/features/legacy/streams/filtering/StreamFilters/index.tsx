import classNames from 'classnames';
import React, {useEffect, useState} from 'react';

import {Filter, FilterOptionWithCounter} from '~/shared/kit/Filter';

import {OrderType, SortIcon} from '@ui/icons/Sort';

import type {LegacyRoketoStream} from '../../../api/roketo/interfaces/entities';
import {DirectionSorts} from '../DirectionSorts';
import {useStreamFilters} from '../useStreamFilters';
import styles from './styles.module.scss';

function compareBy(a: LegacyRoketoStream, b: LegacyRoketoStream, key: keyof LegacyRoketoStream) {
  return Number(b[key]) - Number(a[key]);
}

const sorts = {
  bigBalanceFirst: {
    label: 'With high amount',
    order: OrderType.desc,
    fn: (a: LegacyRoketoStream, b: LegacyRoketoStream) => compareBy(a, b, 'balance'),
  },
  highSpeedFirst: {
    label: 'With high speed',
    order: OrderType.desc,
    fn: (a: LegacyRoketoStream, b: LegacyRoketoStream) => compareBy(a, b, 'tokens_per_tick'),
  },
  highSpeedLast: {
    label: 'With low speed',
    order: OrderType.asc,
    fn: (a: LegacyRoketoStream, b: LegacyRoketoStream) => compareBy(a, b, 'tokens_per_tick') * -1,
  },
  mostRecent: {
    label: 'Most recent',
    order: OrderType.desc,
    fn: (a: LegacyRoketoStream, b: LegacyRoketoStream) => compareBy(a, b, 'timestamp_created'),
  },
};

type StreamFiltersProps = {
  items: LegacyRoketoStream[] | undefined;
  onFilterDone: (result: LegacyRoketoStream[] | undefined) => void;
  className?: string;
};

export function StreamFilters({items, onFilterDone, className}: StreamFiltersProps) {
  const filter = useStreamFilters(items);
  const {filteredItems} = filter.result;

  const [sorting, setSorting] = useState(sorts.mostRecent);
  const sortOptions = Object.values(sorts);
  const isEmptyList = items ? items.length === 0 : true;

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
    <div className={classNames(styles.root, className)}>
      <DirectionSorts
        directions={filter.directionFilter.optionsArray}
        activeDirection={filter.directionFilter.option}
        onDirectionClick={filter.directionFilter.selectOption}
        isInactive={isEmptyList}
      />
      <div className={styles.filtersWrapper}>
        <Filter
          options={filter.statusFilter.optionsArray}
          label="Status:"
          active={filter.statusFilter.option}
          onChange={filter.statusFilter.selectOption}
          isDisabled={isEmptyList}
          renderOption={(option) => {
            const counts = filter.result.filterCounts[1];
            return (
              <FilterOptionWithCounter
                key={option}
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
          isDisabled={isEmptyList}
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
