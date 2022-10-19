import type {BigNumber} from 'bignumber.js';

import type {STREAM_STATUS, StreamDirection} from '~/shared/api/roketo/constants';

export type StreamCardData = {
  streamPageLink: string;
  comment: string | null;
  color: string | null;
  name: string;
  isLocked: boolean;
  showAddFundsButton: boolean;
  showWithdrawButton: boolean;
  showStartButton: boolean;
  showPauseButton: boolean;
  iconType: keyof typeof STREAM_STATUS;
};

export type StreamProgressData = {
  symbol: string;
  sign: string;
  totalText: string;
  progressFull: string;
  progressStreamed: string;
  progressWithdrawn: string;
  cliffPercent: number | null;
  cliffText: string | null;
  speedFormattedValue: string;
  speedUnit: string;
  timeLeft: string;
  streamedText: string;
  streamedPercentage: BigNumber;
  withdrawnText: string;
  withdrawnPercentage: BigNumber;
  direction: StreamDirection | null;
  name: string;
};
