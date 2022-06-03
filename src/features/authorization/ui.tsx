import {useStore} from 'effector-react';

import {$isSignedIn, $nearWallet} from '~/entities/wallet';

import {testIds} from '~/shared/constants';

import {Button} from '@ui/components/Button';
import {LogoutIcon} from '@ui/icons/LogOut';

import styles from './index.module.scss';

export const Authorization = () => {
  const nearWallet = useStore($nearWallet);
  const signedIn = useStore($isSignedIn);

  if (!signedIn) {
    return (
      <Button
        onClick={nearWallet?.auth.login}
        className={styles.root}
        testId={testIds.signInButton}
      >
        <span className={styles.name}>Sign in with NEAR Wallet</span>
        <LogoutIcon />
      </Button>
    );
  }

  return (
    <button
      type="button"
      onClick={nearWallet?.auth.logout}
      className={styles.logoutButton}
      data-testid={testIds.signOutButton}
    >
      <LogoutIcon />
    </button>
  );
};
