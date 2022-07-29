import cn from 'classnames';
import React from 'react';

import {ArrowDown} from '@ui/icons/ArrowDown';

import styles from './styles.module.scss';

type DropdownOpenerProps = {
  opened?: boolean;
  className?: string;
  arrowClassName?: string;
  children: React.ReactNode;
  onChange: (state: boolean) => void;
  testId?: string;
};

export function DropdownOpener({
  opened,
  className,
  arrowClassName,
  children,
  onChange,
  testId,
  ...rest
}: DropdownOpenerProps) {
  const arrowDownClassName = cn(styles.arrow, arrowClassName, {
    [styles.rotate]: opened,
  });

  return (
    <button
      type="button"
      onClick={() => onChange(!opened)}
      className={cn(styles.root, className)}
      data-testid={testId}
      {...rest}
    >
      {children}

      <ArrowDown className={arrowDownClassName} />
    </button>
  );
}
