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

export const NEAR_BRIDGE = 'factory.bridge.near' as const;

export const CONTRACT_VIEW_METHODS = [
  'get_account',
  'get_stream',
  'get_stream_history',
  'get_status',
];
export const CONTRACT_CHANGE_METHODS = [
  'create_stream',
  'deposit',
  'update_account',
  'start_stream',
  'pause_stream',
  'stop_stream',
  'change_auto_deposit',
  'start_cron',
];