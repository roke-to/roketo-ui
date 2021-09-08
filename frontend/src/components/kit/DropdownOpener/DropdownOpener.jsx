import React from 'react';
import {DropdownArrowDown} from '../../icons/DropdownArrowDown';
import classNames from 'classnames';

/**
 * @param {minimal} Boolean remove outline and padding if true
 * @param {rounded} Boolean set to true to change shape to pill
 * @returns
 */
export function DropdownOpener({
  opened,
  className,
  children,
  onClick,
  rounded,
  minimal,
  ...rest
}) {
  const minimalClasses = minimal
    ? ''
    : 'twind-px-4 twind-py-3 twind-border twind-border-border twind-w-36';
  return (
    <button
      onClick={onClick}
      className={classNames(
        'twind-cursor-pointer twind-flex twind-items-center  ',
        className,
        minimalClasses,
        rounded ? 'twind-rounded-full' : 'twind-rounded-xl',
      )}
      {...rest}
    >
      {children}
      <div className="twind-flex-grow"></div>
      <DropdownArrowDown
        className={classNames(
          'twind-ml-2',
          'twind-transform',
          opened ? 'twind-rotate-180' : '',
        )}
      />
    </button>
  );
}
