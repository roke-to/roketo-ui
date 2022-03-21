import React from 'react';
import classNames from 'classnames';

type RadioButtonProps<T> = {
  active: boolean;
  label: React.ReactNode;
  value: T;
  onChange: (value: T) => void;
};

export function RadioButton<T>({
  active, label, value, onChange,
}: RadioButtonProps<T>) {
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
      />

      <div className={classNames(active ? 'font-semibold' : '', 'ml-3 flex')}>
        {label}
      </div>
    </label>
  );
}
