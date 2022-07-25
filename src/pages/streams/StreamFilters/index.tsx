import cn from 'classnames';
import {useStoreMap, useUnit} from 'effector-react';
import React, {useState} from 'react';

import {Filter, FilterOptionWithCounter} from '~/shared/kit/Filter';

import {Button} from '@ui/components/Button';
import {SortIcon} from '@ui/icons/Sort';

import {directionOptions, sortOptions, statusOptions} from '../constants';
import {
  $allStreams,
  $statusFilterCounts,
  $streamFilter,
  $streamSort,
  changeDirectionFilter,
  changeStatusFilter,
  changeStreamSort,
  changeTextFilter,
} from '../model';
import clearIcon from './clear.svg';
import magnifierIcon from './magnifier.svg';
import styles from './styles.module.scss';

export function StreamFilters({className}: {className: string}) {
  const [showInput, setShowInput] = useState(false);

  const [sorting, {direction: activeDirection, status, text: filterText}, statusFilterCounts] =
    useUnit([$streamSort, $streamFilter, $statusFilterCounts]);

  const isEmptyList = useStoreMap($allStreams, (items) => items.length === 0);

  return (
    <div className={cn(styles.root, className)}>
      <Filter
        options={statusOptions}
        label="Status:"
        active={status}
        onChange={changeStatusFilter}
        isDisabled={isEmptyList}
        className={styles.statusBlock}
        controlClassName={styles.filterControl}
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
        className={styles.sortBlock}
        controlClassName={styles.filterControl}
        renderOption={(option) => <span>{option.label}</span>}
        renderActive={(option) => (
          <div className={styles.sortWithOrder}>
            {option.order && <SortIcon type={option.order} />}
            <span>{option.label}</span>
          </div>
        )}
      />
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
      <div className={cn(styles.textFilter, showInput && styles.withInput)} key="text-filter">
        <button
          type="button"
          className={styles.textFilterMagnifier}
          onClick={() => setShowInput(true)}
        >
          <img src={magnifierIcon} alt="search" />
        </button>
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
          placeholder="Search text"
        />
        <button
          type="button"
          className={styles.textFilterClear}
          onClick={() => {
            setShowInput(false);
            changeTextFilter('');
          }}
        >
          <img src={clearIcon} alt="clear" />
        </button>
      </div>
    </div>
  );
}
