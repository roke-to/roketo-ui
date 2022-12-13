import cn from 'classnames';
import {useState} from 'react';

import {CreateStreamProps, StreamType} from '../constants';
import {StreamToNFT} from '../StreamToNFT';
import {StreamToWallet} from '../StreamToWallet';
import styles from './styles.module.scss';

type ButtonProps = {
  onClick: () => void;
  isActive: boolean;
  label: string;
};

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
  const [chosenStreamType, setChosenStreamType] = useState(StreamType.Wallet);

  return (
    <div className={styles.root}>
      <h2 className={styles.title}>Create Stream</h2>

      <div className={styles.tabs}>
        <TabButton
          onClick={() => setChosenStreamType(StreamType.Wallet)}
          isActive={chosenStreamType === StreamType.Wallet}
          label="To Wallet"
        />
        <TabButton
          onClick={() => setChosenStreamType(StreamType.NFT)}
          isActive={chosenStreamType === StreamType.NFT}
          label="To NFT"
        />
      </div>

      {chosenStreamType === StreamType.NFT && (
        <StreamToNFT onFormCancel={onFormCancel} onFormSubmit={onNftFormSubmit} />
      )}
      {chosenStreamType === StreamType.Wallet && (
        <StreamToWallet onFormCancel={onFormCancel} onFormSubmit={onFormSubmit} />
      )}
    </div>
  );
};
