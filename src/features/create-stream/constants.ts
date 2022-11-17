import {env} from '~/shared/config';

export type StreamColor = 'none' | 'red' | 'blue' | 'orange' | 'purple' | 'green';
type ColorDescription = {border: string; color: string};
export const streamColors: StreamColor[] = ['none', 'red', 'blue', 'orange', 'purple', 'green'];
export const colorDescriptions: Record<StreamColor, ColorDescription> = {
  none: {
    border: '#a0c2f8',
    color: 'transparent',
  },
  red: {
    border: '#FF0000',
    color: '#FF0000',
  },
  blue: {
    border: '#2E56E9',
    color: '#2E56E9',
  },
  orange: {
    border: '#ff8C19',
    color: '#ff8C19',
  },
  purple: {
    border: '#8459CA',
    color: '#8459CA',
  },
  green: {
    border: '#008000',
    color: '#008000',
  },
};

export const COMMENT_TEXT_LIMIT = 80;

export type FormValues = {
  receiver: string;
  streamName: string;
  isNotDelayed: boolean;
  comment: string;
  deposit: number;
  duration: number;
  token: string;
  isUnlocked: boolean;
  cliffDateTime: Date | null;
  color: StreamColor;
};

export const INITIAL_FORM_VALUES: FormValues = {
  receiver: '',
  streamName: '',
  token: env.WNEAR_ID,
  duration: 0,
  deposit: 0,
  isNotDelayed: true,
  comment: '',
  isUnlocked: true,
  cliffDateTime: null,
  color: 'none',
};

export type CreateStreamProps = {
  onFormSubmit: (values: FormValues) => Promise<void>;
  onFormCancel: () => void;
  submitting: boolean;
};
