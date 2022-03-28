export const STREAM_STATUS = {
  Initialized: 'Initialized',
  Active: 'Active',
  Paused: 'Paused',
  Finished: 'Finished'
} as const;

export const STREAM_DIRECTION = {
  IN: 'in',
  OUT: 'out',
} as const;

export const STREAM_ACTION_TYPE = {
  INIT: 'Init',
  DEPOSIT: 'Deposit',
  START: 'Start',
  WITHDRAW: 'Withdraw',
  PAUSE: 'Pause',
  STOP: 'Stop',
} as const;

export const SECONDS_IN_MINUTE = 60;
export const SECONDS_IN_HOUR = SECONDS_IN_MINUTE * 60;
export const SECONDS_IN_DAY = SECONDS_IN_HOUR * 24;
