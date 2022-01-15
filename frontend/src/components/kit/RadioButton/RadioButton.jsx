import React from 'react';
import classNames from 'classnames';

export function RadioButton({active, label, value, onChange}) {
  return (
    <label className="inline-flex items-center whitespace-nowrap">
      <input
        type="radio"
        className="invisible w-0 h-0 absolute"
        checked={active}
        onChange={() => onChange(value)}
      />
      <div
        className={classNames(
          active ? 'border-blue border-4' : 'border-border border-2',
          'border-full w-3 h-3 rounded-full',
        )}
      ></div>

      <div className={classNames(active ? 'font-semibold' : '', 'ml-3 flex')}>
        {label}
      </div>
    </label>
  );
}
