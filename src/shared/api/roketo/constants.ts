export const STREAM_STATUS = {
  Initialized: 'Initialized',
  Active: 'Active',
  Paused: 'Paused',
  Stopped: 'Stopped',
  Finished: 'Finished',
} as const;

export const STREAM_DIRECTION = {
  IN: 'in',
  OUT: 'out',
} as const;

export type StreamDirection = 'in' | 'out';

export const STORAGE_DEPOSIT = '0.0025';
