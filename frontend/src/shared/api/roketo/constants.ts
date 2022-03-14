export const STREAM_STATUS = {
  INITIALIZED: 'INITIALIZED',
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  ARCHIVED: 'ARCHIVED',
  FINISHED: 'FINISHED',
  INTERRUPTED: 'INTERRUPTED',
} as const;

export const STREAM_DIRECTION = {
  IN: 'in',
  OUT: 'out',
} as const;

export const STREAM_AUTODEPOSIT_STATUS = {
  ENABLED: 'enabled',
  DISABLED: 'disabled',
} as const;

export const STREAM_ACTION_TYPE = {
  INIT: 'Init',
  DEPOSIT: 'Deposit',
  START: 'Start',
  WITHDRAW: 'Withdraw',
  PAUSE: 'Pause',
  STOP: 'Stop',
} as const;
