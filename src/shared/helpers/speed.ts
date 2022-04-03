import {
  SECONDS_IN_DAY, SECONDS_IN_HOUR, SECONDS_IN_MINUTE,
  TimePeriod,
} from '@app/shared/constants';

export const getBalancePerDesiredPeriod = (balancePerSecond: number, period: TimePeriod): number => {
  switch (period) {
    case TimePeriod.Minute:
      return balancePerSecond * SECONDS_IN_MINUTE;
    case TimePeriod.Hour:
      return balancePerSecond * SECONDS_IN_HOUR;
    case TimePeriod.Day:
      return balancePerSecond * SECONDS_IN_DAY;
    default:
      return balancePerSecond;
  }
};
