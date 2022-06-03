import classNames from 'classnames';
import React from 'react';

import styles from './styles.module.scss';

type BadgeProps = {
  isOrange?: boolean;
  children: React.ReactNode;
  className?: string;
};

export function Badge({isOrange, children, className}: BadgeProps) {
  return (
    <span className={classNames(styles.badge, isOrange ? styles.orange : styles.blue, className)}>
      {children}
    </span>
  );
}
