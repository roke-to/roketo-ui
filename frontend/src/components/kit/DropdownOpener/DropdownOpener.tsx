import React from 'react';
import classNames from 'classnames';
import { DropdownArrowDown } from '../../icons/DropdownArrowDown';

type DropdownOpenerProps = {
  opened?: never;
  className?: never;
  children: React.ReactNode;
  onChange: (state: boolean) => void;
  rounded: boolean;
  minimal: boolean;
};

/**
 * @param {minimal} Boolean remove outline and padding if true
 * @param {rounded} Boolean set to true to change shape to pill
 * @returns
 */
export function DropdownOpener({
  opened,
  className,
  children,
  onChange,
  rounded,
  minimal,
  ...rest
}: DropdownOpenerProps) {
  const minimalClasses = minimal
    ? ''
    : 'px-4 py-3 border border-border w-36 hover:bg-hover hover:border-hover';

  return (
    <button
      type="button"
      onClick={() => onChange(!opened)}
      className={classNames(
        'cursor-pointer flex items-center',
        className,
        minimalClasses,
        rounded ? 'rounded-full' : 'rounded-lg',
      )}
      {...rest}
    >
      {children}
      <div className="flex-grow" />
      <DropdownArrowDown
        className={classNames('ml-2', 'transform', opened ? 'rotate-180' : '')}
      />
    </button>
  );
}
