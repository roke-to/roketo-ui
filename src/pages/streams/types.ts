import type {BigNumber} from 'bignumber.js';

import type {StreamDirection} from '~/shared/api/roketo/constants';
import type {RoketoStream} from '~/shared/api/roketo/interfaces/entities';

import type {OrderType} from '@ui/icons/Sort';

export type DirectionFilter = 'All' | 'Incoming' | 'Outgoing';
export type StatusFilter = 'All' | 'Initialized' | 'Active' | 'Paused';

export type StreamSort = {
  label: string;
  order: OrderType;
  fn: (a: RoketoStream, b: RoketoStream) => number;
};

export type FilterFn = (stream: RoketoStream) => boolean;

export type StreamCardData = {
  streamPageLink: string;
  comment: string | null;
  color: string | null;
  name: string;
  isIncomingStream: boolean;
  isLocked: boolean;
};

export type StreamProgressData = {
  symbol: string;
  progressText: string;
  progressFull: string;
  progressStreamed: string;
  progressWithdrawn: string;
  cliffPercent: number | null;
  speedFormattedValue: string;
  speedUnit: string;
  timeLeft: string;
  streamedText: string;
  streamedPercentage: BigNumber;
  withdrawnText: string;
  withdrawnPercentage: BigNumber;
  direction: StreamDirection | null;
};