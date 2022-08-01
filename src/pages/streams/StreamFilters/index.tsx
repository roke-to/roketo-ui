import cn from 'classnames';
import {useGate, useStoreMap, useUnit} from 'effector-react';
import React, {useState} from 'react';
import Modal from 'react-modal';

import {blurGate} from '~/entities/blur';
import {$isSmallScreen} from '~/entities/screen';

import {Filter, FilterOptionWithCounter} from '~/shared/kit/Filter';
import {RadioButton} from '~/shared/kit/RadioButton';

import {Button} from '@ui/components/Button';
import {OrderType, SortIcon} from '@ui/icons/Sort';

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
  const [showCompactFilterModal, setShowCompactFilterModal] = useState(false);

  const [
    sorting,
    {direction: activeDirection, status, text: filterText},
    statusFilterCounts,
    isSmallScreen,
  ] = useUnit([$streamSort, $streamFilter, $statusFilterCounts, $isSmallScreen]);

  const isEmptyList = useStoreMap($allStreams, (items) => items.length === 0);

  useGate(blurGate, {
    modalId: 'compactFilterModal',
    active: isSmallScreen && showCompactFilterModal,
  });

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
      <Modal
        isOpen={isSmallScreen && showCompactFilterModal}
        onRequestClose={() => setShowCompactFilterModal(false)}
        className={cn(styles.modalContent, styles.compactFilterModal)}
        overlayClassName={cn(styles.modalOverlay)}
      >
        <h3>Direction:</h3>
        {directionOptions.map((direction) => (
          <RadioButton
            key={direction}
            active={direction === activeDirection}
            label={<span>{direction}</span>}
            value={direction}
            onChange={changeDirectionFilter}
          />
        ))}
        <h3>Status:</h3>
        {statusOptions.map((option) => (
          <RadioButton
            key={option}
            active={option === status}
            label={
              <span>
                {option} <span className={styles.countText}>{statusFilterCounts[option]}</span>
              </span>
            }
            value={option}
            onChange={changeStatusFilter}
          />
        ))}
        <h3>Show first:</h3>
        {sortOptions.map((sort) => (
          <RadioButton
            key={sort.label}
            label={<span>{sort.label}</span>}
            active={sort === sorting}
            value={sort}
            onChange={changeStreamSort}
          />
        ))}
      </Modal>
      <Button
        className={cn(styles.directionSort, styles.compactFilter)}
        onClick={() => setShowCompactFilterModal(!showCompactFilterModal)}
        disabled={isEmptyList}
      >
        <SortIcon type={OrderType.desc} />
      </Button>
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
