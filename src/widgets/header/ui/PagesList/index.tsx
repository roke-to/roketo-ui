import React from 'react';
import {NavLink} from 'react-router-dom';

import {Route} from '~/shared/lib/routing';

import styles from './styles.module.scss';

type PageListProps = {
  pageRoutes: Route[];
  activeClassName?: string;
};

export const PageList = (props: PageListProps) => {
  const {pageRoutes = [], activeClassName} = props;

  if (pageRoutes.length === 0) {
    return null;
  }

  return (
    <ul className={styles.root}>
      {pageRoutes.map((route) => (
        <li className={styles.pageLink} key={route.path}>
          <NavLink to={route.path} activeClassName={activeClassName}>
            {route.title}
          </NavLink>
        </li>
      ))}
    </ul>
  );
};
