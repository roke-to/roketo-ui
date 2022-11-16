import {STREAM_STATUS} from '~/shared/api/roketo/constants';

import activeStreamIcon from './activeStream.svg';
import finishedStreamIcon from './finishedStream.svg';
import pausedStreamIcon from './pausedStream.svg';

export function StatusIcon(iconType: keyof typeof STREAM_STATUS) {
  switch (iconType) {
    case 'Active':
      return activeStreamIcon;
    case 'Stopped':
    case 'Finished':
      return finishedStreamIcon;
    case 'Initialized':
    case 'Paused':
    default:
      return pausedStreamIcon;
  }
}
