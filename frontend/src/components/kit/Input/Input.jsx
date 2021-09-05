import React from 'react';
import './Input.scss';
import classNames from 'classnames';

export function Input({ children, error, ...rest }) {
  const borderColor = error ? 'twind-border-red-400' : 'twind-border-border';
  return (
    <label
      className={classNames(
        'Input twind-font-semibold twind-flex twind-p-4 twind-rounded-lg twind-border  twind-bg-input twind-text-white focus-within:twind-border-blue hover:twind-border-blue',
        borderColor,
      )}
      {...rest}
    >
      {children}
    </label>
  );
}
