import React from 'react';
import './Input.scss';
import classNames from 'classnames';

type InputProps = {
  children: React.ReactNode;
  className?: string;
  error?: never;
};

export function Input({
  children, className, error, ...rest
}: InputProps) {
  const borderColor = error ? 'border-red-400' : 'border-border';
  return (
    <label
      className={classNames(
        'Input font-semibold flex p-4 rounded-lg border  bg-input text-white focus-within:border-blue hover:border-blue',
        borderColor,
        className,
      )}
      {...rest}
    >
      {children}
    </label>
  );
}