import BigNumber from 'bignumber.js';

import {
  SECONDS_IN_DAY, SECONDS_IN_HOUR, SECONDS_IN_MINUTE,
  TimePeriod,
} from 'shared/constants';

export const getBalancePerDesiredPeriod = (balancePerSecond: string, period: TimePeriod) => {
  const balanceSpeedPerSecond = new BigNumber(balancePerSecond);

  switch (period) {
    case TimePeriod.Minute:
      return balanceSpeedPerSecond.multipliedBy(SECONDS_IN_MINUTE);
    case TimePeriod.Hour:
      return balanceSpeedPerSecond.multipliedBy(SECONDS_IN_HOUR);
    case TimePeriod.Day:
      return balanceSpeedPerSecond.multipliedBy(SECONDS_IN_DAY);
    default:
      return balanceSpeedPerSecond;
  }
};
