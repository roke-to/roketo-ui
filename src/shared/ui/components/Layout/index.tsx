import cn from 'classnames';
import React from 'react';

import styles from './styles.module.scss';

type LayoutProps = {
  children?: React.ReactNode;
  className?: string;
};

export const Layout = ({children, className}: LayoutProps) => (
  <div className={cn(styles.layout, className)}>{children}</div>
);
