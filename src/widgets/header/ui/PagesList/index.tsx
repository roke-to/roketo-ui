import classNames from 'classnames';
import React from 'react';
import {NavLink} from 'react-router-dom';

import {Route} from '~/shared/lib/routing';

import styles from './styles.module.scss';

type PageListProps = {
  pageRoutes: Route[];
  className?: string;
  activeClassName?: string;
};

export const PageList = (props: PageListProps) => {
  const {pageRoutes = [], className, activeClassName} = props;

  if (pageRoutes.length === 0) {
    return null;
  }

  return (
    <ul className={classNames(styles.root, className)}>
      {pageRoutes.map((route) => (
        <li className={styles.pageLink} key={route.path}>
          <NavLink to={route.path} activeClassName={activeClassName} exact>
            {route.title}
          </NavLink>
        </li>
      ))}
    </ul>
  );
};
