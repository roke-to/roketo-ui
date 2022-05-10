import React, { useState } from 'react';

import {useRoketoContext} from 'app/roketo-context';
import {useUser} from 'shared/api/roketo-web';
import { DropdownOpener } from 'shared/kit/DropdownOpener';
import { DropdownMenu } from 'shared/kit/DropdownMenu';
import { ProfileForm } from 'widgets/profile-form';

import { Button } from '@ui/components/Button';
import {LogoutIcon} from '@ui/icons/LogOut';

import {env} from 'shared/config';
import { testIds } from 'shared/constants';

import styles from './index.module.scss';
import { Notifications } from './Notifications';

export const Authorization = () => {
  const [isDropdownOpened, setIsDropdownOpened] = useState(false);
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
      <div className={styles.profile}>
        <DropdownOpener
          onChange={setIsDropdownOpened}
          className={styles.dropdownOpener}
          opened={isDropdownOpened}
        >
          <span className={styles.name}>
            {name || accountId}
          </span>

          <img
            className={styles.avatar}
            src={`${env.WEB_API_URL}/users/${accountId}/avatar?email=${email}`}
            alt=""
          />
        </DropdownOpener>

        <DropdownMenu
          opened={isDropdownOpened}
          onClose={() => setIsDropdownOpened(false)}
          className={styles.dropdownMenu}
        >
          <ProfileForm />
        </DropdownMenu>
      </div>

      <Notifications />

      <button type='button' onClick={logout} className={styles.logoutButton}>
        <LogoutIcon />
      </button>
    </div>
  );
};

