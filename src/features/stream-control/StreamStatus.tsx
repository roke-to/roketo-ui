import type {RoketoStream} from '@roketo/sdk/dist/types';
import classNames from 'classnames';
import React from 'react';

import {STREAM_STATUS} from '~/shared/api/roketo/constants';

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

export function StreamStatus({
  status,
  className,
}: {
  status: RoketoStream['status'];
  className?: string;
}) {
  const binding = typeof status === 'string' ? bindings[status] : bindings[STREAM_STATUS.Finished];

  return <div className={classNames(className)}>{binding.label}</div>;
}
