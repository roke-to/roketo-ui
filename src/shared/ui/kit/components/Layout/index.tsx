import React from 'react';
import cn from 'classnames';

import styles from './styles.module.scss';

type LayoutProps = {
  children?: React.ReactNode,
  className?: string,
}

export const Layout = (props: LayoutProps) => {
  const {
    children,
    className,
  } = props;

  const classNames = cn(
    "container mx-auto",
    styles.layout,
    className
  );

  return (
    <div className={classNames}>
      {children}
    </div>
  );
};
