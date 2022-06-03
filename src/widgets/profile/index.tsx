import {useStore} from 'effector-react';
import {useState} from 'react';

import {$accountId, $user} from '~/entities/wallet';

import {env} from '~/shared/config';
import {DropdownMenu} from '~/shared/kit/DropdownMenu';
import {DropdownOpener} from '~/shared/kit/DropdownOpener';

import styles from './index.module.scss';
import {ProfileForm} from './ProfileForm';

export const Profile = () => {
  const [isDropdownOpened, setIsDropdownOpened] = useState(false);
  const [needFallback, setNeedFallback] = useState(false);

  const accountId = useStore($accountId);

  const {name, email} = useStore($user);

  return (
    <div className={styles.profile}>
      <DropdownOpener
        onChange={setIsDropdownOpened}
        className={styles.dropdownOpener}
        opened={isDropdownOpened}
      >
        <span className={styles.name}>{name || accountId}</span>

        {needFallback || !accountId ? (
          <svg className={styles.avatar} />
        ) : (
          <img
            className={styles.avatar}
            src={`${env.WEB_API_URL}/users/${accountId}/avatar?email=${email}`}
            alt=""
            onError={() => setNeedFallback(true)}
          />
        )}
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
