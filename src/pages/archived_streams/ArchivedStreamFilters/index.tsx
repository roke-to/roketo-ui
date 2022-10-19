import cn from 'classnames';
import {useGate, useStoreMap, useUnit} from 'effector-react';
import React, {useState} from 'react';
import Modal from 'react-modal';

import {blurGate} from '~/entities/blur';
import {$isSmallScreen} from '~/entities/screen';
import {$archivedStreams} from '~/entities/wallet';

import {Filter} from '~/shared/kit/Filter';
import {RadioButton} from '~/shared/kit/RadioButton';

import {Button} from '@ui/components/Button';
import {OrderType, SortIcon} from '@ui/icons/Sort';

import {directionOptions, sortOptions} from '../constants';
import {$streamFilter, $streamSort, changeDirectionFilter, changeStreamSort} from '../model';
import styles from './styles.module.scss';

export function ArchivedStreamFilters({className}: {className: string}) {
  const [showCompactFilterModal, setShowCompactFilterModal] = useState(false);

  const [sorting, {direction: activeDirection}, isSmallScreen] = useUnit([
    $streamSort,
    $streamFilter,
    $isSmallScreen,
  ]);

  const isEmptyList = useStoreMap($archivedStreams, ({streams}) => streams.length === 0);

  useGate(blurGate, {
    modalId: 'compactFilterModal',
    active: isSmallScreen && showCompactFilterModal,
  });

  return (
    <div className={cn(styles.root, className)}>
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
