import BigNumber from 'bignumber.js';

import {ApplicationResponseDto, RoketoStream} from '~/shared/api/rb';

import {OrderType} from '@ui/icons/Sort';

import {StatusFilter, SubscriptionSort} from './lib';
import type {SubscriptionCardData, SubscriptionProgressData} from './types';

export const subscriptionProgressDataDefaults: SubscriptionProgressData = {
  symbol: '',
  progressFull: '',
  progressStreamed: '',
  streamedText: '',
  totalText: '',
  streamedPercentage: new BigNumber(0),
};

export const RoketoStreamDefaults: RoketoStream = {
  balance: '',
  cliff: 0,
  creator_id: '',
  description: '',
  id: '',
  is_expirable: false,
  is_locked: false,
  last_action: 0,
  owner_id: '',
  receiver_id: '',
  status: 'Active',
  timestamp_created: 0,
  token_account_id: '',
  tokens_per_sec: '',
  tokens_total_withdrawn: '',
};

export const subscriptionCardDataDefaults: SubscriptionCardData = {
  serviceName: '',
  serviceIcon: '',
  endDate: null,
  timeLeft: null,
  stream: RoketoStreamDefaults,
  iconType: 'Active',
  showAddFundsButton: false,
  showStartButton: false,
  showPauseButton: false,
};

export const sorts = {
  bigBalanceFirst: {
    label: 'Big balances',
    order: OrderType.desc,
    fn: (a: ApplicationResponseDto, b: ApplicationResponseDto) => compareBy(a, b, 'amount'),
  },
  bigBalanceLast: {
    label: 'Low balances',
    order: OrderType.desc,
    fn: (a: ApplicationResponseDto, b: ApplicationResponseDto) => compareBy(a, b, 'amount') * -1,
  },
  mostRecent: {
    label: 'Most recent',
    order: OrderType.desc,
    fn: (a: ApplicationResponseDto, b: ApplicationResponseDto) => compareBy(a, b, 'createdAt'),
  },
};

function compareBy(
  a: ApplicationResponseDto,
  b: ApplicationResponseDto,
  key: keyof ApplicationResponseDto,
) {
  return Number(b[key]) - Number(a[key]);
}

export const sortOptions: SubscriptionSort[] = Object.values(sorts);
export const statusOptions: StatusFilter[] = ['All', 'Active', 'Paused', 'Stopped', 'Finished'];
