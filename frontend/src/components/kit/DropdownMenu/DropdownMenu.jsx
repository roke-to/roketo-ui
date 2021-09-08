import React from 'react';
import classNames from 'classnames';

export function DropdownMenu({opened, children, className}) {
  return (
    <div
      className={classNames(
        className,
        'twind-absolute twind-top-full pt-2',
        opened ? 'twind-flex' : 'twind-hidden',
      )}
    >
      <div
        className={classNames('twind-bg-hover twind-rounded-2xl twind-py-2')}
      >
        {children}
      </div>
    </div>
  );
}

export function DropdownMenuItem({children, className, ...rest}) {
  return (
    <div
      className={classNames(
        'twind-px-3 twind-py-1 twind-font-semibold twind-text-sm hover:twind-font-bold',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function DropdownMenuDivider() {
  return (
    <div className="twind-border-dark twind-border-t twind-w-full twind-my-2" />
  );
}
