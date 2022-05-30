export const STREAM_STATUS = {
  INITIALIZED: 'INITIALIZED',
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  FINISHED: 'FINISHED',
  INTERRUPTED: 'INTERRUPTED',
} as const;

export const STREAM_DIRECTION = {
  IN: 'in',
  OUT: 'out',
} as const;

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
