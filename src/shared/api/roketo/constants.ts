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
