import React from 'react';

import {Route} from "shared/helpers/routing";

import NavigationLink from "shared/components/NavigationLink";

import styles from './styles.module.scss';

type PageListProps = {
  pageRoutes: Route[],
}

export const PageList = (props: PageListProps) => {
  const {pageRoutes = []} = props;

  if (pageRoutes.length === 0) {
    return null;
  }

  return (
    <ul className={styles.root}>
      {pageRoutes.map(route => (
        <li className={styles.pageLink} key={route.path}>
          <NavigationLink
            to={route.path}
          >
            {route.title}
          </NavigationLink>
        </li>
      ))}
    </ul>
  );
};
