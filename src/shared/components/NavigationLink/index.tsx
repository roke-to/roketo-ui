import React from 'react';
import cn from 'classnames';
import { Link, useRouteMatch } from 'react-router-dom';

import styles from './styles.module.scss';

type Props = {
  children?: React.ReactNode,
  className?: string,

  onClick?: () => void;
  to: string,
}

const NavigationLink = (props: Props) => {
  const {
    to,
    className,
    children,
    onClick,
  } = props;

  const match = useRouteMatch(to);
  const isActive = match?.isExact ?? false;

  const classNames = cn(
    styles.root,
    {[styles.active]: isActive},
    className,
  );

  return (
    <Link
      to={to}
      className={classNames}
      onClick={onClick}
    >
      {children}
    </Link>
  );
};

export default NavigationLink;
