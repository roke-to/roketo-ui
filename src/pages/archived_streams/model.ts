import {getStreamDirection, getStreamProgress, parseComment} from '@roketo/sdk';
import type {RoketoStream} from '@roketo/sdk/dist/types';
import {format} from 'date-fns';
import {createEvent, createStore, sample} from 'effector';
import {generatePath} from 'react-router-dom';

import {$isSmallScreen} from '~/entities/screen';
import {$accountId, $archivedStreams, $tokens} from '~/entities/wallet';

import {toHumanReadableValue} from '~/shared/api/token-formatter';
import {areArraysDifferent, areObjectsDifferent, recordUpdater} from '~/shared/lib/changeDetection';
import {
  DirectionFilter,
  FilterFn,
  getDirectionFilter,
  StatusFilter,
  StreamSort,
} from '~/shared/lib/getFilters';
import {isWNearTokenId} from '~/shared/lib/isWNearTokenId';
import {ROUTES_MAP} from '~/shared/lib/routing';

import {sorts} from './constants';
import type {StreamCardData} from './types';

export const $streamListData = createStore(
  {
    streamsLoading: true,
    hasStreams: false,
  },
  {updateFilter: areObjectsDifferent},
);

export const $filteredStreams = createStore<RoketoStream[]>([], {updateFilter: areArraysDifferent});

export const $streamFilter = createStore({
  direction: 'All' as DirectionFilter,
  status: 'All' as StatusFilter,
  text: '',
});

export const changeDirectionFilter = createEvent<DirectionFilter>();

export const changeStreamSort = createEvent<StreamSort>();
export const $streamSort = createStore<StreamSort>(sorts.mostRecent);

export const $streamCardsData = createStore<Record<string, StreamCardData>>({});

export const selectStream = createEvent<string | null>();
export const $selectedStream = createStore<string | null>(null);

sample({
  source: $archivedStreams,
  fn: ({streamsLoaded, streams}) => ({
    streamsLoading: !streamsLoaded,
    hasStreams: streams.length > 0,
  }),
  target: $streamListData,
});

sample({
  source: {
    streams: $archivedStreams,
    filter: $streamFilter,
    accountId: $accountId,
    sort: $streamSort,
  },
  target: $filteredStreams,
  fn({streams: {streams}, filter: {direction}, accountId, sort}) {
    const filters = [getDirectionFilter(accountId, direction)].filter((fn): fn is FilterFn => !!fn);

    const result =
      filters.length === 0
        ? [...streams]
        : streams.filter((item) => filters.every((filter) => filter(item)));
    return result.sort(sort.fn);
  },
});

sample({clock: changeStreamSort, target: $streamSort});

sample({
  clock: [$filteredStreams, $tokens],
  source: {
    accountId: $accountId,
    oldData: $streamCardsData,
    tokens: $tokens,
    streams: $filteredStreams,
  },
  fn: ({accountId, oldData, tokens, streams}) =>
    recordUpdater(oldData, streams, (stream, id) => {
      const {token_account_id: tokenId} = stream;
      const token = tokens[tokenId];
      if (!token) return undefined;
      const {decimals} = token.meta;
      const symbol = isWNearTokenId(tokenId) ? 'NEAR' : token.meta.symbol;
      const direction = getStreamDirection(stream, accountId);
      const progress = getStreamProgress({stream});
      const total = Number(toHumanReadableValue(decimals, progress.full, 3));
      const isIncomingStream = direction === 'IN';
      return {
        name: isIncomingStream ? stream.owner_id : stream.receiver_id,
        comment: parseComment(stream.description),
        direction,
        total,
        symbol,
        start: format(new Date(Number(stream.timestamp_created) / 1000000), 'dd.MM.yyyy'),
        end: format(new Date(Number(stream.timestamp_created) / 1000000), 'dd.MM.yyyy'),
        streamPageLink: generatePath(ROUTES_MAP.stream.path, {id}),
      };
    }),
  target: $streamCardsData,
});

sample({
  clock: selectStream,
  source: $selectedStream,
  filter: $isSmallScreen,
  fn: (currentSelection, upd) => (upd === currentSelection ? null : upd),
  target: $selectedStream,
});

sample({
  clock: $isSmallScreen,
  filter: (isSmallScreen) => !isSmallScreen,
  fn: () => null,
  target: $selectedStream,
});

$streamFilter.on(changeDirectionFilter, (filter, direction) => ({...filter, direction}));
