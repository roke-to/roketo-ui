import React from 'react';
import classNames from 'classnames';
export function FormField({ children, label, error, className, ...rest }) {
  return (
    <label className={classNames('twind-block', className)} {...rest}>
      <div className="twind-mb-1">{label}</div>
      <div>{children}</div>
      {error ? (
        <div className="twind-text-red-500 twind-mt-1 twind-text-xs">
          {error}
        </div>
      ) : null}
    </label>
  );
}
