import {ModuleState} from '@near-wallet-selector/core';
import cn from 'classnames';
import {useStore} from 'effector-react';
import {useState} from 'react';

import {
  $isSignedIn,
  $walletSelectorState,
  loginViaWalletFx,
  logoutFx,
  walletClicked,
} from '~/entities/wallet';

import {resolveWalletIcon, WalletIconType} from '~/shared/api/near/options';
import {testIds} from '~/shared/constants';

import {Button} from '@ui/components/Button';
import {LogoutIcon} from '@ui/icons/LogOut';

import styles from './index.module.scss';

export const Authorization = () => {
  const [clickedWallet, setClickedWallet] = useState('');
  const signedIn = useStore($isSignedIn);
  const {modules} = useStore($walletSelectorState);
  const isLoading = useStore(loginViaWalletFx.pending);

  const handleWalletClick = (module: ModuleState) => () => {
    setClickedWallet(module.id);
    walletClicked(module);
  };

  if (!signedIn) {
    return (
      <div className={styles.root}>
        {modules.map((module: ModuleState) => {
          // @ts-expect-error
          const {name, iconUrl, available, downloadUrl} = module.metadata;
          console.log(module);
          const clicked = module.id === clickedWallet;
          const WalletIcon = resolveWalletIcon(iconUrl as WalletIconType);

          const description = clicked && isLoading ? 'Connecting...' : name;

          return (
            <Button
              key={module.id}
              onClick={
                available ? handleWalletClick(module) : () => window.open(downloadUrl, '_blank')
              }
              className={cn(styles.button, {[styles.isLoading]: isLoading && clicked})}
              testId={module.id === 'near-wallet' ? testIds.signInButton : ''}
              disabled={isLoading}
            >
              <img src={WalletIcon} alt={name} className={styles.logo} />
              <span className={styles.name}>{description}</span>
            </Button>
          );
        })}
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
