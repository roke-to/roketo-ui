import React from 'react'
import classNames from 'classnames';

import { STREAM_STATUS } from '~/shared/api/roketo/constants';
import type { RoketoStream } from '~/shared/api/roketo/interfaces/entities';

const bindings = {
  [STREAM_STATUS.Initialized]: {
    label: 'Initialized',
  },
  [STREAM_STATUS.Active]: {
    label: 'Active',
  },
  [STREAM_STATUS.Paused]: {
    label: 'Paused',
  },
  [STREAM_STATUS.Finished]: {
    label: 'Finished',
  },
} as const;

type StreamStatusProps = {
  stream: RoketoStream;
  className?: string;
};

export function StreamStatus({ stream, className }: StreamStatusProps) {
  const binding = typeof stream.status === 'string'
    ? bindings[stream.status]
    : bindings[STREAM_STATUS.Finished];

  return (
    <div className={classNames(className)}>
      {binding.label}
    </div>
  );
}
