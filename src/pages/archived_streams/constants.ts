import type {RoketoStream} from '@roketo/sdk/dist/types';

import {DirectionFilter, StreamSort} from '~/shared/lib/getFilters';

import {OrderType} from '@ui/icons/Sort';

import type {StreamCardData} from './types';

export const streamCardDataDefaults: StreamCardData = {
  name: '',
  comment: '',
  direction: null,
  total: 0,
  symbol: '',
  start: '',
  end: '',
  streamPageLink: '',
};

export const sorts = {
  bigBalanceFirst: {
    label: 'With high amount',
    order: OrderType.desc,
    fn: (a: RoketoStream, b: RoketoStream) => compareBy(a, b, 'tokens_total_withdrawn'),
  },
  mostRecent: {
    label: 'Most recent',
    order: OrderType.desc,
    fn: (a: RoketoStream, b: RoketoStream) => compareBy(a, b, 'timestamp_created'),
  },
};

function compareBy(a: RoketoStream, b: RoketoStream, key: keyof RoketoStream) {
  return Number(b[key]) - Number(a[key]);
}

export const sortOptions: StreamSort[] = Object.values(sorts);
export const directionOptions: DirectionFilter[] = ['All', 'Incoming', 'Outgoing'];
