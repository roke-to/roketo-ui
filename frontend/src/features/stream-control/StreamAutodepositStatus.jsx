import {STREAM_AUTODEPOSIT_STATUS} from './lib';
import classNames from 'classnames';

export function StreamAutodepositStatus({
  stream,
  className,
  disableMsg,
  enableMsg,
  ...rest
}) {
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

  const status = stream.is_auto_deposit_enabled ? 'enabled' : 'disabled';
  const binding = bindings[status] || {};

  return (
    <div className={classNames(binding.colorClass, className)} {...rest}>
      {binding.label}
    </div>
  );
}
