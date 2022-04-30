import React from 'react';

import {useRoketoContext} from 'app/roketo-context';
import {useUser} from 'shared/api/roketo-web';

import {LogoutIcon} from '@ui/icons/LogOut';

import {env} from 'shared/config';

import styles from './index.module.scss';

export const Authorization = () => {
  const {auth} = useRoketoContext();
  const userSWR = useUser();

  const {name, email} = userSWR.data ?? {};
  const {accountId} = auth;
  const {login, logout, signedIn} = auth;

  if (!signedIn) {
    return (
      <button type='button' onClick={login} className={styles.root}>
        <span className={styles.name}>Sign in with NEAR Wallet</span>
        <LogoutIcon />
      </button>
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
        alt="user avatar"
      />

      <button type='button' onClick={logout}>
        <LogoutIcon />
      </button>
    </div>
  );
};

