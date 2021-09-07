import React from 'react';
import classNames from 'classnames';

export function RadioButton({active, label, value, onChange}) {
  return (
    <label className="twind-inline-flex twind-items-center twind-whitespace-nowrap">
      <input
        type="radio"
        className="twind-invisible twind-w-0 twind-h-0 twind-absolute"
        checked={active}
        onChange={() => onChange(value)}
      />
      <div
        className={classNames(
          active
            ? 'twind-border-blue twind-border-4'
            : 'twind-border-border twind-border-2',
          'twind-border-full twind-w-3 twind-h-3 twind-rounded-full',
        )}
      ></div>

      <div
        className={classNames(
          active ? 'twind-font-semibold' : '',
          'twind-ml-3',
        )}
      >
        {label}
      </div>
    </label>
  );
}
