import React from 'react';
import classNames from 'classnames';
import {useOutsideClick} from '../../../lib/useOutsideClick';

export function DropdownMenu({opened, children, className, onClose}) {
  const ref = React.useRef();
  useOutsideClick(ref, () => {
    if (opened) {
      onClose();
    }
  });

  return (
    <div
      ref={ref}
      className={classNames(
        className,
        'absolute top-full pt-2',
        opened ? 'flex' : 'hidden',
      )}
    >
      <div className={classNames('w-full bg-hover rounded-2xl py-2')}>
        {children}
      </div>
    </div>
  );
}

export function DropdownMenuItem({children, className, ...rest}) {
  return (
    <div
      className={classNames(
        'px-5 py-1 font-semibold text-sm hover:font-bold',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function DropdownMenuDivider() {
  return <div className="border-dark border-t w-full my-2" />;
}
