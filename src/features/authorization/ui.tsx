import React from 'react';

import {useRoketoContext} from 'app/roketo-context';
import { Profile } from 'widgets/profile';

import { Button } from '@ui/components/Button';
import {LogoutIcon} from '@ui/icons/LogOut';

import { testIds } from 'shared/constants';

import styles from './index.module.scss';
import { Notifications } from './Notifications';

export const Authorization = () => {
  const {auth} = useRoketoContext();
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
      <Profile />

      <Notifications />

      <button type='button' onClick={logout} className={styles.logoutButton}>
        <LogoutIcon />
      </button>
    </div>
  );
};

