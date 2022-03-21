import React from 'react';
import classNames from 'classnames';

type FormFieldProps = {
  children: React.ReactNode;
  label: React.ReactNode;
  error?: string;
  className?: string;
};

export function FormField({
  children, label, error, className, ...rest
}: FormFieldProps) {
  return (
    <div className={classNames('block', className)} {...rest}>
      <div className="mb-1">{label}</div>
      <div>{children}</div>
      {error ? <div className="text-red-500 mt-1 text-xs">{error}</div> : null}
    </div>
  );
}
