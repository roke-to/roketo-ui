import classNames from 'classnames';
import { STREAM_STATUS } from 'shared/api/roketo/constants';

export function StreamStatus({ stream, className, ...rest }) {
  const bindings = {
    [STREAM_STATUS.INITIALIZED]: {
      colorClass: 'text-special-active',
      label: 'Initialized',
    },
    [STREAM_STATUS.ACTIVE]: {
      colorClass: 'text-special-active',
      label: 'Active',
    },
    [STREAM_STATUS.PAUSED]: {
      colorClass: 'text-special-hold',
      label: 'Paused',
    },
    [STREAM_STATUS.FINISHED]: {
      colorClass: 'text-special-active',
      label: 'Finished',
    },
    [STREAM_STATUS.INTERRUPTED]: {
      colorClass: 'text-special-inactive',
      label: 'Interrupted',
    },
  };

  const binding = bindings[stream.status] || {};

  return (
    <div className={classNames(binding.colorClass, className)} {...rest}>
      {binding.label}
    </div>
  );
}
