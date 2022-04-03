
export const SECONDS_IN_MINUTE = 60;
export const SECONDS_IN_HOUR = SECONDS_IN_MINUTE * 60;
export const SECONDS_IN_DAY = SECONDS_IN_HOUR * 24;
export const SECONDS_IN_WEEK = SECONDS_IN_DAY * 7;
export const SECONDS_IN_MONTH = SECONDS_IN_WEEK * 4;
export const SECONDS_IN_YEAR = SECONDS_IN_MONTH * 12;

export enum TimePeriod {
  Second = 'second',
  Minute = 'minute',
  Hour = 'hour',
  Day = 'day',
}

export const TIME_PERIOD_SIGNS = {
  [TimePeriod.Hour]: '/h',
  [TimePeriod.Day]: '/d',
  [TimePeriod.Minute]: '/m',
  [TimePeriod.Second]: '/s',
}
