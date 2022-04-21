import React from 'react';
import cn from 'classnames';

import {ArrowDown} from '@ui/icons/ArrowDown';

import styles from './styles.module.scss';

type DropdownOpenerProps = {
  opened?: boolean;
  className?: string;
  children: React.ReactNode;
  onChange: (state: boolean) => void;
};

export function DropdownOpener({
  opened,
  className,
  children,
  onChange,
  ...rest
}: DropdownOpenerProps) {
  const arrowClassName = cn({
    [styles.arrow]: true,
    [styles.rotate]: opened,
  });

  return (
    <button
      type="button"
      onClick={() => onChange(!opened)}
      className={cn(styles.root, className)}
      {...rest}
    >
      {children}

      <ArrowDown className={arrowClassName}/>
    </button>
  );
}
