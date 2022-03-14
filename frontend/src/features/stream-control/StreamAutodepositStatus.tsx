import classNames from 'classnames';

import { STREAM_AUTODEPOSIT_STATUS } from 'shared/api/roketo/constants';
import { RoketoStream } from 'shared/api/roketo/interfaces/entities';

type StreamAutodepositStatusProps = {
  stream: RoketoStream;
  className?: string;
  disableMsg?: string;
  enableMsg?: string;
};

export function StreamAutodepositStatus({
  stream,
  className,
  disableMsg,
  enableMsg,
  ...rest
}: StreamAutodepositStatusProps) {
  const bindings = {
    [STREAM_AUTODEPOSIT_STATUS.ENABLED]: {
      colorClass: 'text-special-hold',
      label: disableMsg || 'Enabled',
    },
    [STREAM_AUTODEPOSIT_STATUS.DISABLED]: {
      colorClass: 'text-special-active',
      label: enableMsg || 'Disabled',
    },
  };

  const status = stream.auto_deposit_enabled ? 'enabled' : 'disabled';
  const binding = bindings[status] || {};

  return (
    <div className={classNames(binding.colorClass, className)} {...rest}>
      {binding.label}
    </div>
  );
}
