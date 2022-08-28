import myNearIcon from './my-near-wallet-icon.png';
import nearIcon from './near-wallet-icon.png';
import senderIcon from './sender-wallet-icon.png';

export enum WalletIconType {
  MyNearWallet = 'MyNearWallet',
  NearWallet = 'NearWallet',
  Sender = 'Sender',
}

const walletIcons = {
  [WalletIconType.MyNearWallet]: myNearIcon,
  [WalletIconType.NearWallet]: nearIcon,
  [WalletIconType.Sender]: senderIcon,
};

export const resolveWalletIcon = (iconUrl: WalletIconType) => walletIcons[iconUrl];
