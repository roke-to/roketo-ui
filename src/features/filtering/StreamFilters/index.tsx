import classNames from 'classnames';
import {useStore, useStoreMap} from 'effector-react';
import React, {useEffect, useMemo, useState} from 'react';

import {$account, $accountId, $accountStreams} from '~/entities/wallet';

import type {RoketoStream} from '~/shared/api/roketo/interfaces/entities';
import {useMediaQuery} from '~/shared/hooks/useMatchQuery';
import {Filter, FilterOptionWithCounter} from '~/shared/kit/Filter';

import {OrderType, SortIcon} from '@ui/icons/Sort';

import {DirectionSorts} from '../DirectionSorts';
import {STREAM_TYPE_FILTER, useStreamFilters} from '../useStreamFilters';
import {ReactComponent as Clear} from './clear.svg';
import {ReactComponent as Magnifier} from './magnifier.svg';
import styles from './styles.module.scss';

function compareBy(a: RoketoStream, b: RoketoStream, key: keyof RoketoStream) {
  return Number(b[key]) - Number(a[key]);
}

const sorts = {
  bigBalanceFirst: {
    label: 'With high amount',
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

export function StreamFilters({items, onFilterDone, className}: StreamFiltersProps) {
  const [showInput, setShowInput] = useState(false);
  const [filterText, setFilterText] = useState('');
  const filter = useStreamFilters(items);
  const {filteredItems} = filter.result;
  const accountId = useStore($accountId);

  const {
    active_incoming_streams: totalIncomingStreamsCount = 0,
    active_outgoing_streams: totalOutgoingStreamsCount = 0,
  } = useStore($account) ?? {};

  const {incomingStreamsCount, outgoingStreamsCount} = useStoreMap(
    $accountStreams,
    ({inputs, outputs}) => ({
      incomingStreamsCount: inputs.length,
      outgoingStreamsCount: outputs.length,
    }),
  );

  const isSmallForTextFilterInput = useMediaQuery('(max-width: 1111px)') && showInput;
  const isSmallForTextFilterButton = useMediaQuery('(max-width: 767px)') && !showInput;
  const isSmallForTextFilter = isSmallForTextFilterInput || isSmallForTextFilterButton;

  const [sorting, setSorting] = useState(sorts.mostRecent);
  const sortOptions = Object.values(sorts);
  const isEmptyList = items ? items.length === 0 : true;

  const filteredItemsByText = useMemo(
    () =>
      filteredItems?.filter(({description, receiver_id, owner_id}) => {
        const trimmedFilterText = filterText.trim();

        if (!trimmedFilterText) {
          return true;
        }

        const comment =
          (() => {
            try {
              const parsedDescription = JSON.parse(description);
              return parsedDescription.comment ?? parsedDescription.c;
            } catch {
              return description;
            }
          })() ?? '';

        const counterActor = accountId === owner_id ? receiver_id : owner_id;

        return comment.includes(trimmedFilterText) || counterActor.includes(trimmedFilterText);
      }),
    [accountId, filteredItems, filterText],
  );

  useEffect(() => {
    if (!filteredItemsByText) {
      onFilterDone(filteredItemsByText);

      return;
    }

    const sortedStreams = [...filteredItemsByText];

    sortedStreams.sort(sorting.fn);

    onFilterDone(sortedStreams);
  }, [filteredItemsByText, onFilterDone, sorting.fn]);

  const isIncomingOnly = filter.directionFilter.option === STREAM_TYPE_FILTER.INCOMING;
  const isOutgoingOnly = filter.directionFilter.option === STREAM_TYPE_FILTER.OUTGOING;

  const shouldCountIncoming = !isOutgoingOnly;
  const shouldCountOutgoing = !isIncomingOnly;

  const streamsCount =
    (shouldCountIncoming ? incomingStreamsCount : 0) +
    (shouldCountOutgoing ? outgoingStreamsCount : 0);
  const streamsTotalCount =
    (shouldCountIncoming ? totalIncomingStreamsCount : 0) +
    (shouldCountOutgoing ? totalOutgoingStreamsCount : 0);

  const textFilter = (
    <div className={classNames(styles.textFilter, showInput && styles.withInput)} key="text-filter">
      <Magnifier className={styles.textFilterMagnifier} />
      <input
        className={styles.textFilterInput}
        value={filterText}
        onChange={(e) => setFilterText(e.currentTarget.value)}
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
            setFilterText('');
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
    <div className={classNames(styles.root, className)}>
      {isSmallForTextFilter && <div className={styles.smallFilterWrapper}>{textFilter}</div>}

      <DirectionSorts
        directions={filter.directionFilter.optionsArray}
        activeDirection={filter.directionFilter.option}
        onDirectionClick={filter.directionFilter.selectOption}
        isInactive={isEmptyList}
      />

      {!isSmallForTextFilter && textFilter}

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
