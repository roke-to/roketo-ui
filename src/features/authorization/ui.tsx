import {useStore} from 'effector-react';
import {useState} from 'react';

import {$isSignedIn, loginFx, logoutFx} from '~/entities/wallet';

import {testIds} from '~/shared/constants';

import {Button} from '@ui/components/Button';
import {LogoutIcon} from '@ui/icons/LogOut';

import styles from './index.module.scss';
import nearIcon from './near-wallet-icon.png';
import senderIcon from './sender-wallet-icon.png';

const SENDER_DOWNLOAD_URL =
  'https://chrome.google.com/webstore/detail/sender-wallet/epapihdplajcdnnkdeiahlgigofloibg';

export const Authorization = () => {
  const signedIn = useStore($isSignedIn);
  const [showSenderInstallInfo, setInstallInfo] = useState(false);
  const isLoading = useStore(loginFx.pending);

  let senderText = isLoading ? 'Connecting...' : 'Sender Wallet';
  if (showSenderInstallInfo) {
    senderText = 'You need to install Sender chrome extension';
  }

  if (!signedIn) {
    return (
      <div className={styles.root}>
        <Button
          onClick={() => loginFx('near')}
          className={styles.button}
          testId={testIds.signInButton}
          disabled={isLoading}
        >
          <img src={nearIcon} alt="NEAR Wallet" className={styles.logo} />
          <span className={styles.name}>{isLoading ? 'Connecting...' : 'NEAR Wallet'}</span>
        </Button>
        <Button
          onClick={() => {
            if (window.near) {
              loginFx('sender');
            } else {
              window.open(SENDER_DOWNLOAD_URL, '_blank');
              setInstallInfo(true);
            }
          }}
          className={styles.button}
          disabled={isLoading || showSenderInstallInfo}
        >
          <img src={senderIcon} alt="Sender Wallet" className={styles.logo} />
          <span className={styles.name}>{senderText}</span>
        </Button>
      </div>
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
