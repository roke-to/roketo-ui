import senderIcon from '@near-wallet-selector/sender/assets/sender-icon.png';
import {useStore} from 'effector-react';

import {$isSignedIn, loginFx, logoutFx} from '~/entities/wallet';

import {testIds} from '~/shared/constants';

import {Button} from '@ui/components/Button';
import {LogoutIcon} from '@ui/icons/LogOut';

import styles from './index.module.scss';
import nearIcon from './near-wallet-icon.png';

export const Authorization = () => {
  const signedIn = useStore($isSignedIn);

  if (!signedIn) {
    return (
      <>
        <Button
          onClick={() => loginFx('near')}
          className={styles.root}
          testId={testIds.signInButton}
        >
          <img src={nearIcon} alt="NEAR Wallet" className={styles.logo} />
          <span className={styles.name}>Sign in with NEAR Wallet</span>
          <LogoutIcon />
        </Button>
        <Button
          onClick={() => loginFx('sender')}
          className={styles.root}
          testId={testIds.signInButton}
        >
          <img src={senderIcon} alt="Sender Wallet" className={styles.logo} />
          <span className={styles.name}>Sign in with Sender Wallet</span>
          <LogoutIcon />
        </Button>
      </>
    );
  }

  return (
    <button
      type="button"
      onClick={() => logoutFx()}
      className={styles.logoutButton}
      data-testid={testIds.signOutButton}
    >
      <LogoutIcon />
    </button>
  );
};
