import {attach, sample} from 'effector';

import {$nearWallet, createNearWalletFx, initWallets, resetOnLogout} from './account';

const loginRawFx = attach({
  source: $nearWallet,
  async effect(wallet) {
    await wallet?.auth.login();
  },
});

export const loginFx = attach({
  source: $nearWallet,
  async effect(wallet, walletType: 'near' | 'sender') {
    const currentWalletType = wallet?.walletType ?? null;
    if (currentWalletType && currentWalletType !== walletType) {
      await wallet?.auth.logout();
      await createNearWalletFx(walletType);
    } else if (!wallet) {
      await createNearWalletFx(walletType);
    }
    await loginRawFx();
  },
});

export const logoutFx = attach({
  source: $nearWallet,
  async effect(wallet) {
    await wallet?.auth.logout();
  },
});

resetOnLogout.onCreateStore((store) => {
  store.reset(logoutFx.done);
});

sample({
  clock: loginFx.doneData,
  target: initWallets,
});
