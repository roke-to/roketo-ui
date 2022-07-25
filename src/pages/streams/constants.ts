import {BigNumber} from 'bignumber.js';

import type {RoketoStream} from '~/shared/api/roketo/interfaces/entities';

import {OrderType} from '@ui/icons/Sort';

import type {
  DirectionFilter,
  StatusFilter,
  StreamCardData,
  StreamProgressData,
  StreamSort,
} from './types';

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
  progressText: '',
  progressFull: '',
  progressStreamed: '',
  progressWithdrawn: '',
  cliffPercent: null,
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

function compareBy(a: RoketoStream, b: RoketoStream, key: keyof RoketoStream) {
  return Number(b[key]) - Number(a[key]);
}

export const sortOptions: StreamSort[] = Object.values(sorts);
export const statusOptions: StatusFilter[] = ['All', 'Initialized', 'Active', 'Paused'];
export const directionOptions: DirectionFilter[] = ['All', 'Incoming', 'Outgoing'];
