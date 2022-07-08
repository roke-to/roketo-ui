import classNames from 'classnames';
import React from 'react';

import {STREAM_STATUS} from '~/shared/api/roketo/constants';
import type {StreamStatus as StreamStatusType} from '~/shared/api/roketo/interfaces/entities';

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

export function StreamStatus({status, className}: {status: StreamStatusType; className?: string}) {
  const binding = typeof status === 'string' ? bindings[status] : bindings[STREAM_STATUS.Finished];

  return <div className={classNames(className)}>{binding.label}</div>;
}
