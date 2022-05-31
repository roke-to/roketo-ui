import React from 'react';
import classNames from 'classnames';
import { useRouteMatch } from 'react-router-dom';

import { ROUTES_MAP } from 'shared/helpers/routing';
import {Logo} from '@ui/icons/Logo';
import { Header as FullHeader } from 'widgets/header/Header';

import styles from './styles.module.scss';

function MinifiedHeader() {
  return (
    <div
      className={classNames(
        'py-4 px-6',
        'absolute w-full pt-8',
        'flex justify-center',
      )}
    >
      <Logo className={styles.logo} />
    </div>
  );
}

export function Header() {
  const onAuthorizePage = useRouteMatch(ROUTES_MAP.authorize.path);

  if (onAuthorizePage) {
    return <MinifiedHeader />;
  }

  return <FullHeader />;
}