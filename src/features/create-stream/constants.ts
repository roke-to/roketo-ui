import {env} from 'shared/config';

export const INITIAL_FORM_VALUES = {
  receiver: '',
  streamName: '',
  token: env.WNEAR_ID,
  speed: 0,
  deposit: 0,
  autoStart: true,
  comment: '',
};
