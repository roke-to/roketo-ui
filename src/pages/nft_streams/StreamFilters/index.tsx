import cn from 'classnames';
import {useGate, useStoreMap, useUnit} from 'effector-react';
import React, {useState} from 'react';
import Modal from 'react-modal';

import {blurGate} from '~/entities/blur';
import {$isSmallScreen} from '~/entities/screen';

import {Filter} from '~/shared/kit/Filter';
import {RadioButton} from '~/shared/kit/RadioButton';

import {Button} from '@ui/components/Button';
import {OrderType, SortIcon} from '@ui/icons/Sort';

import {sortOptions} from '../constants';
import {
  $filteredStreams,
  $statusFilterCounts,
  $streamFilter,
  $streamSort,
  changeStreamSort,
  changeTextFilter,
} from '../model';
import clearIcon from './clear.svg';
import magnifierIcon from './magnifier.svg';
import styles from './styles.module.scss';

export function StreamFilters({className}: {className: string}) {
  const [showInput, setShowInput] = useState(false);
  const [showCompactFilterModal, setShowCompactFilterModal] = useState(false);

  const [sorting, {text: filterText}, isSmallScreen] = useUnit([
    $streamSort,
    $streamFilter,
    $statusFilterCounts,
    $isSmallScreen,
  ]);

  const isEmptyList = useStoreMap($filteredStreams, (streams) => streams.length === 0);

  useGate(blurGate, {
    modalId: 'compactFilterModal',
    active: isSmallScreen && showCompactFilterModal,
  });

  return (
    <div className={cn(styles.root, className)}>
      <div className={cn(styles.textFilter, showInput && styles.withInput)} key="text-filter">
        <img src={magnifierIcon} className={styles.textFilterMagnifier} alt="search" />
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
      <Filter
        options={sortOptions}
        label="Sort by:"
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
    </div>
  );
}
