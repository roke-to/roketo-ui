import classNames from 'classnames';
import React from 'react';

export function CategoryTabs({label, options, onChange, active}) {
  return (
    <div className="twind-flex twind-text-lg">
      <div className="twind-text-gray">{label}</div>
      {options.map((option, index) => (
        <button
          className={classNames(
            active === index ? 'twind-font-bold' : 'twind-font-normal',
            'twind-text-white twind-mx-3',
          )}
          onClick={() => onChange(index)}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
