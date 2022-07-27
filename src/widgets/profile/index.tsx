import {useGate, useStore} from 'effector-react';
import {useCallback, useState} from 'react';

import {UserAvatar} from '~/widgets/profile/UserAvatar';

import {blurGate} from '~/entities/blur';
import {$accountId, $user} from '~/entities/wallet';

import {useMediaQuery} from '~/shared/hooks/useMatchQuery';
import {AdaptiveModal} from '~/shared/kit/AdaptiveModal';
import {DropdownOpener} from '~/shared/kit/DropdownOpener';

import styles from './index.module.scss';
import {ProfileForm} from './ProfileForm';

export const Profile = () => {
  const [isProfileOpened, setIsProfileOpened] = useState(false);
  const isCompact = useMediaQuery('(max-width: 767px)');
  const closeProfile = useCallback(() => setIsProfileOpened(false), [setIsProfileOpened]);

  useGate(blurGate, {
    modalId: 'profile',
    active: isCompact && isProfileOpened,
  });

  const accountId = useStore($accountId);

  const {name} = useStore($user);

  return (
    <div className={styles.profile}>
      <DropdownOpener
        onChange={setIsProfileOpened}
        className={styles.dropdownOpener}
        opened={isProfileOpened}
      >
        {!isCompact && <span className={styles.name}>{name || accountId}</span>}
        <UserAvatar className={styles.avatar} />
      </DropdownOpener>
      <AdaptiveModal
        compact={isCompact}
        onClose={closeProfile}
        isOpen={isProfileOpened}
        dropdownClassName={styles.dropdownMenu}
        modalClassName={styles.modal}
      >
        <ProfileForm showFinances={isCompact} />
      </AdaptiveModal>
    </div>
  );
};
