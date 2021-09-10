import {STREAM_AUTODEPOSIT_STATUS} from './lib';
import classNames from 'classnames';

export function StreamAutodepositStatus({stream, className, disableMsg, enableMsg,...rest}) {
  const bindings = {
    [STREAM_AUTODEPOSIT_STATUS.ENABLED]: {
      colorClass: 'twind-text-special-hold',
      label: disableMsg || 'Enabled',
    },
    [STREAM_AUTODEPOSIT_STATUS.DISABLED]: {
      colorClass: 'twind-text-special-active',
      label: enableMsg || 'Disabled',
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
