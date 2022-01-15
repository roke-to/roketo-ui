import classNames from 'classnames';
import React from 'react';

export function CategoryTabs({label, options, onChange, active}) {
  return (
    <div className="flex text-lg">
      <div className="text-gray">{label}</div>
      {options.map((option, index) => (
        <button
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
