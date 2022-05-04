import React from 'react';

import {useRoketoContext} from 'app/roketo-context';
import {useUser} from 'shared/api/roketo-web';

import { Button } from '@ui/components/Button';
import {LogoutIcon} from '@ui/icons/LogOut';

import {env} from 'shared/config';
import { testIds } from 'shared/constants';

import styles from './index.module.scss';

export const Authorization = () => {
  const {auth} = useRoketoContext();
  const userSWR = useUser();

  const {name, email} = userSWR.data ?? {};
  const {accountId} = auth;
  const {login, logout, signedIn} = auth;

  if (!signedIn) {
    return (
      <Button onClick={login} className={styles.root} testId={testIds.signInButton}>
        <span className={styles.name}>Sign in with NEAR Wallet</span>
        <LogoutIcon />
      </Button>
    )
  }

  return (
    <div className={styles.root}>
      <span className={styles.name}>
        {name || accountId}
      </span>

      <img
        className={styles.avatar}
        src={`${env.WEB_API_URL}/users/${accountId}/avatar?email=${email}`}
        alt=""
      />

      <button type='button' onClick={logout}>
        <LogoutIcon />
      </button>
    </div>
  );
};

