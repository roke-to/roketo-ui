import classNames from 'classnames';

import { STREAM_STATUS } from 'shared/api/roketo/constants';
import type { RoketoStream } from 'shared/api/roketo/interfaces/entities';

const bindings = {
  [STREAM_STATUS.Initialized]: {
    colorClass: 'text-special-active',
    label: 'Initialized',
  },
  [STREAM_STATUS.Active]: {
    colorClass: 'text-special-active',
    label: 'Active',
  },
  [STREAM_STATUS.Paused]: {
    colorClass: 'text-special-hold',
    label: 'Paused',
  },
  [STREAM_STATUS.Finished]: {
    colorClass: 'text-special-active',
    label: 'Finished',
  },
} as const;

type StreamStatusProps = {
  stream: RoketoStream;
  className?: string;
};

export function StreamStatus({ stream, className }: StreamStatusProps) {
  const binding = bindings[stream.status] || {};

  return (
    <div className={classNames(binding.colorClass, className)}>
      {binding.label}
    </div>
  );
}
