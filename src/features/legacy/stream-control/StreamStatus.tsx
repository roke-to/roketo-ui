import React from 'react'
import classNames from 'classnames';

import { STREAM_STATUS } from '../api/roketo/constants';
import type { LegacyRoketoStream } from '../api/roketo/interfaces/entities';

const bindings = {
  [STREAM_STATUS.INITIALIZED]: {
    label: 'Initialized',
  },
  [STREAM_STATUS.ACTIVE]: {
    label: 'Active',
  },
  [STREAM_STATUS.PAUSED]: {
    label: 'Paused',
  },
  [STREAM_STATUS.FINISHED]: {
    label: 'Finished',
  },
  [STREAM_STATUS.INTERRUPTED]: {
    label: 'Finished',
  },
} as const;

type StreamStatusProps = {
  stream: LegacyRoketoStream;
  className?: string;
};

export function StreamStatus({ stream, className }: StreamStatusProps) {
  const binding = bindings[stream.status];

  return (
    <div className={classNames(className)}>
      {binding.label}
    </div>
  );
}
