import React from 'react';
import cn from 'classnames';

import styles from './styles.module.scss';

type LayoutProps = {
  children?: React.ReactNode,
  className?: string,
}

export const Layout = ({ children, className }: LayoutProps) => (
  <div className={cn(styles.layout, className)}>
    {children}
  </div>
);
