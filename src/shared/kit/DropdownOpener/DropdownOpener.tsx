import cn from 'classnames';
import React from 'react';

import {useMediaQuery} from '~/shared/hooks/useMatchQuery';

import {ArrowDown} from '@ui/icons/ArrowDown';

import styles from './styles.module.scss';

type DropdownOpenerProps = {
  opened?: boolean;
  className?: string;
  children: React.ReactNode;
  onChange: (state: boolean) => void;
  testId?: string;
};

export function DropdownOpener({
  opened,
  className,
  children,
  onChange,
  testId,
  ...rest
}: DropdownOpenerProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const arrowClassName = cn(styles.arrow, {
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

      {isDesktop && <ArrowDown className={arrowClassName} />}
    </button>
  );
}
