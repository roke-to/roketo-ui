import {STREAM_AUTODEPOSIT_STATUS} from './lib';
import classNames from 'classnames';

export function StreamAutodepositStatus({stream, className, ...rest}) {
  const bindings = {
    [STREAM_AUTODEPOSIT_STATUS.ENABLED]: {
      colorClass: 'twind-text-special-hold',
      label: 'Enabled',
    },
    [STREAM_AUTODEPOSIT_STATUS.DISABLED]: {
      colorClass: 'twind-text-special-active',
      label: 'Disabled',
    },
  };
  
  const status = stream.auto_deposit_enabled ? 'enabled' : 'disabled' 
  console.log(status, stream.auto_deposit_enabled)
  const binding = bindings[status] || {};

  return (
    <div className={classNames(binding.colorClass, className)} {...rest}>
      {binding.label}
    </div>
  );
}
