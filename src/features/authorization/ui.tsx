import senderIcon from '@near-wallet-selector/sender/assets/sender-icon.png';
import {useStore} from 'effector-react';
import {useState} from 'react';

import {$isSignedIn, loginFx, logoutFx} from '~/entities/wallet';

import {testIds} from '~/shared/constants';

import {Button} from '@ui/components/Button';
import {LogoutIcon} from '@ui/icons/LogOut';

import styles from './index.module.scss';
import nearIcon from './near-wallet-icon.png';

const SENDER_DOWNLOAD_URL =
  'https://chrome.google.com/webstore/detail/sender-wallet/epapihdplajcdnnkdeiahlgigofloibg';

export const Authorization = () => {
  const signedIn = useStore($isSignedIn);
  const [walletType, selectWallet] = useState<'near' | 'sender'>('near');
  const [showSenderInstallInfo, setInstallInfo] = useState(false);
  const isLoading = useStore(loginFx.pending);

  const nearText =
    isLoading && walletType === 'near' ? 'Signing in...' : 'Sign in with NEAR Wallet';
  let senderText = 'Sign in with Sender Wallet';
  if (showSenderInstallInfo) {
    senderText = 'You need to install Sender chrome extension';
  } else if (isLoading && walletType === 'sender') {
    senderText = 'Signing in...';
  }

  if (!signedIn) {
    return (
      <>
        <Button
          onClick={() => {
            selectWallet('near');
            // TODO: rewrite into `loginButtonPressed` event
            loginFx('near');
          }}
          className={styles.root}
          testId={testIds.signInButton}
          disabled={isLoading}
        >
          <img src={nearIcon} alt="NEAR Wallet" className={styles.logo} />
          <span className={styles.name}>{nearText}</span>
          <LogoutIcon />
        </Button>
        <Button
          onClick={() => {
            if (window.near) {
              selectWallet('sender');
              loginFx('sender');
            } else {
              window.open(SENDER_DOWNLOAD_URL, '_blank');
              setInstallInfo(true);
            }
          }}
          className={styles.root}
          disabled={isLoading || showSenderInstallInfo}
        >
          <img src={senderIcon} alt="Sender Wallet" className={styles.logo} />
          <span className={styles.name}>{senderText}</span>
          <LogoutIcon />
        </Button>
      </>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        // TODO: rewrite into `logoutButtonPressed`
        logoutFx();
      }}
      className={styles.logoutButton}
      data-testid={testIds.signOutButton}
    >
      <LogoutIcon />
    </button>
  );
};
