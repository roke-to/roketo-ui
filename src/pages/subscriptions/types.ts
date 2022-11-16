import BigNumber from 'bignumber.js';

import {RoketoStream} from '~/shared/api/rb';
import {STREAM_STATUS} from '~/shared/api/roketo/constants';

export type SubscriptionProgressData = {
  symbol: string;
  progressFull: string;
  progressStreamed: string;
  streamedText: string;
  totalText: string;
  streamedPercentage: BigNumber;
};

export type SubscriptionCardData = {
  serviceName: string;
  serviceIcon: string;
  endDate: string | null;
  timeLeft: string | null;
  stream: RoketoStream;
  iconType: keyof typeof STREAM_STATUS;
  showAddFundsButton: boolean;
  showStartButton: boolean;
  showPauseButton: boolean;
};
