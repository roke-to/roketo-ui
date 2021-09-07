import React from 'react';
import classNames from 'classnames';

export function DropdownMenu({opened, children, className}) {
  return (
    <div
      className={classNames(
        className,
        'twind-absolute twind-top-full twind-right-0 pt-2 twind-max-w-full',
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

export function DropdownMenuItem({children}) {
  return <div className="twind-px-3 twind-py-1">{children}</div>;
}

export function DropdownMenuDivider() {
  return (
    <div className="twind-border-border twind-border-t twind-w-full twind-my-2" />
  );
}
