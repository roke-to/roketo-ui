import cn from 'classnames';
import {useStoreMap, useUnit} from 'effector-react';
import React, {useState} from 'react';

import {useMediaQuery} from '~/shared/hooks/useMatchQuery';
import {Filter, FilterOptionWithCounter} from '~/shared/kit/Filter';

import {Button} from '@ui/components/Button';
import {SortIcon} from '@ui/icons/Sort';

import {directionOptions, sortOptions, statusOptions} from '../constants';
import {
  $allStreams,
  $statusFilterCounts,
  $streamFilter,
  $streamsCount,
  $streamSort,
  changeDirectionFilter,
  changeStatusFilter,
  changeStreamSort,
  changeTextFilter,
} from '../model';
import {ReactComponent as Clear} from './clear.svg';
import {ReactComponent as Magnifier} from './magnifier.svg';
import styles from './styles.module.scss';

export function StreamFilters({className}: {className: string}) {
  const [showInput, setShowInput] = useState(false);
  const isSmallForTextFilterInput = useMediaQuery('(max-width: 1111px)') && showInput;
  const isSmallForTextFilterButton = useMediaQuery('(max-width: 767px)') && !showInput;
  const isSmallForTextFilter = isSmallForTextFilterInput || isSmallForTextFilterButton;

  const [
    {streamsCount, streamsTotalCount},
    sorting,
    {direction: activeDirection, status, text: filterText},
    statusFilterCounts,
  ] = useUnit([$streamsCount, $streamSort, $streamFilter, $statusFilterCounts]);

  const isEmptyList = useStoreMap($allStreams, (items) => items.length === 0);

  const textFilter = (
    <div className={cn(styles.textFilter, showInput && styles.withInput)} key="text-filter">
      <Magnifier className={styles.textFilterMagnifier} />
      <input
        className={styles.textFilterInput}
        value={filterText}
        onChange={(e) => changeTextFilter(e.currentTarget.value)}
        onFocus={() => setShowInput(true)}
        onBlur={(e) => {
          const isEmptyInput = e.currentTarget.value.trim() === '';
          if (isEmptyInput) {
            setShowInput(false);
          }
        }}
      />
      {filterText.trim() && (
        <Clear
          className={styles.textFilterClear}
          onClick={() => {
            setShowInput(false);
            changeTextFilter('');
          }}
        />
      )}
      {showInput && streamsCount < streamsTotalCount && (
        <div className={styles.countDisclaimer}>
          Filtering the first {streamsCount} streams from the total {streamsTotalCount}
        </div>
      )}
    </div>
  );

  return (
    <div className={cn(styles.root, className)}>
      {isSmallForTextFilter && <div className={styles.smallFilterWrapper}>{textFilter}</div>}

      <div className={styles.directionSorts}>
        {directionOptions.map((direction) => (
          <Button
            key={direction}
            className={cn(styles.directionSort, {
              [styles.directionActive]: direction === activeDirection,
            })}
            onClick={() => changeDirectionFilter(direction)}
            disabled={isEmptyList}
          >
            {direction}
          </Button>
        ))}
      </div>

      {!isSmallForTextFilter && textFilter}

      <div className={styles.filtersWrapper}>
        <Filter
          options={statusOptions}
          label="Status:"
          active={status}
          onChange={changeStatusFilter}
          isDisabled={isEmptyList}
          renderOption={(option) => (
            <FilterOptionWithCounter
              key={option}
              option={option}
              count={statusFilterCounts[option]}
            />
          )}
        />

        <Filter
          options={sortOptions}
          label="Show first:"
          active={sorting}
          onChange={changeStreamSort}
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
