import type {RoketoStream} from '@roketo/sdk/dist/types';
import {BigNumber} from 'bignumber.js';

import {StreamSort} from '~/shared/lib/getFilters';

import {OrderType} from '@ui/icons/Sort';

import type {StreamCardData, StreamProgressData} from './types';

export const streamCardDataDefaults: StreamCardData = {
  streamPageLink: '',
  comment: '',
  color: '',
  name: '',
  isLocked: false,
  showAddFundsButton: false,
  showWithdrawButton: false,
  showStartButton: false,
  showPauseButton: false,
  iconType: 'Initialized',
};

export const streamProgressDataDefaults: StreamProgressData = {
  symbol: '',
  sign: '',
  totalText: '',
  progressFull: '',
  progressStreamed: '',
  progressWithdrawn: '',
  cliffPercent: null,
  cliffText: null,
  speedFormattedValue: '',
  speedUnit: '',
  timeLeft: '',
  streamedText: '',
  streamedPercentage: new BigNumber(0),
  withdrawnText: '',
  withdrawnPercentage: new BigNumber(0),
  direction: null,
  name: '',
};

export const sorts = {
  bigBalanceFirst: {
    label: 'With high amount',
    order: OrderType.desc,
    fn: (a: RoketoStream, b: RoketoStream) => compareBy(a, b, 'balance'),
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
