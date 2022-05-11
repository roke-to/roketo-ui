import React, { useState } from 'react';

import {useRoketoContext} from 'app/roketo-context';
import {useUser} from 'shared/api/roketo-web';
import { DropdownOpener } from 'shared/kit/DropdownOpener';
import { DropdownMenu } from 'shared/kit/DropdownMenu';
import {env} from 'shared/config';

import { ProfileForm } from './ProfileForm';

import styles from './index.module.scss';

export const Profile = () => {
  const [isDropdownOpened, setIsDropdownOpened] = useState(false);
  const { auth } = useRoketoContext();
  const userSWR = useUser();

  const {name, email} = userSWR.data ?? {};
  const { accountId } = auth;

  return (
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
  );
};

