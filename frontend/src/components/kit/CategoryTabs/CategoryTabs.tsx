import classNames from 'classnames';
import React from 'react';

type CategoryTabsProps = {
  label: never;
  options: never[];
  onChange: (index: number) => void;
  active: never;
};

export function CategoryTabs({
  label, options, onChange, active,
}: CategoryTabsProps) {
  return (
    <div className="flex text-lg">
      <div className="text-gray">{label}</div>
      {options.map((option, index) => (
        <button
          type="button"
          className={classNames(
            active === index ? 'font-bold' : 'font-normal',
            'text-white mx-3',
          )}
          onClick={() => onChange(index)}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
