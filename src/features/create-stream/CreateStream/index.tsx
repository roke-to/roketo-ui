import cn from 'classnames';
import {useState} from 'react';

import {CreateStreamProps} from '../constants';
import {StreamToNFT} from '../StreamToNFT';
import {StreamToWallet} from '../StreamToWallet';
import styles from './styles.module.scss';

type ButtonProps = {
  onClick: () => void;
  isActive: boolean;
  label: string;
};

enum StreamDestinationType {
  Wallet = 'Wallet',
  NFT = 'NFT',
}

const TabButton = ({onClick, isActive, label}: ButtonProps) => (
  <button
    type="button"
    className={cn(styles.tabsButton, isActive ? styles.isActive : '')}
    onClick={onClick}
  >
    {label}
  </button>
);

export const CreateStream = ({onFormCancel, onFormSubmit, onNftFormSubmit}: CreateStreamProps) => {
  const [chosenStreamType, setChosenStreamType] = useState(StreamDestinationType.Wallet);

  return (
    <div className={styles.root}>
      <h2 className={styles.title}>Create Stream</h2>

      <div className={styles.tabs}>
        <TabButton
          onClick={() => setChosenStreamType(StreamDestinationType.Wallet)}
          isActive={chosenStreamType === StreamDestinationType.Wallet}
          label="To Wallet"
        />
        <TabButton
          onClick={() => setChosenStreamType(StreamDestinationType.NFT)}
          isActive={chosenStreamType === StreamDestinationType.NFT}
          label="To NFT"
        />
      </div>

      {chosenStreamType === StreamDestinationType.NFT && (
        <StreamToNFT onFormCancel={onFormCancel} onFormSubmit={onNftFormSubmit} />
      )}
      {chosenStreamType === StreamDestinationType.Wallet && (
        <StreamToWallet onFormCancel={onFormCancel} onFormSubmit={onFormSubmit} />
      )}
    </div>
  );
};
