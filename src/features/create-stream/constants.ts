import {env} from '~/shared/config';

export type StreamColor = 'none' | 'red' | 'blue' | 'orange' | 'purple' | 'green';
export type ColorDescription = {label: string; color: string};
export const streamColors: StreamColor[] = ['none', 'red', 'blue', 'orange', 'purple', 'green'];
export const colorDescriptions: Record<StreamColor, ColorDescription> = {
  none: {
    label: '-',
    color: 'transparent',
  },
  red: {
    label: 'Red',
    color: '#FF0000',
  },
  blue: {
    label: 'Blue',
    color: '#2E56E9',
  },
  orange: {
    label: 'Orange',
    color: '#ff8C19',
  },
  purple: {
    label: 'Purple',
    color: '#8459CA',
  },
  green: {
    label: 'Green',
    color: '#008000',
  },
};

export const COMMENT_TEXT_LIMIT = 80;

export const INITIAL_FORM_VALUES = {
  receiver: '',
  streamName: '',
  token: env.WNEAR_ID,
  speed: 0,
  deposit: 0,
  delayed: false,
  comment: '',
  isLocked: false,
  cliffDateTime: null,
  color: 'none' as StreamColor,
};
