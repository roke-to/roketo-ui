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

enum CreationStream {
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

export const CreateStream = ({onFormCancel, onFormSubmit, submitting}: CreateStreamProps) => {
  const [chosenStreamType, setChosenStreamType] = useState(CreationStream.Wallet);
  console.log(submitting);

  return (
    <div className={styles.root}>
      <h2 className={styles.title}>Create Stream</h2>

      <div className={styles.tabs}>
        <TabButton
          onClick={() => setChosenStreamType(CreationStream.Wallet)}
          isActive={chosenStreamType === CreationStream.Wallet}
          label="To Wallet"
        />
        <TabButton
          onClick={() => setChosenStreamType(CreationStream.NFT)}
          isActive={chosenStreamType === CreationStream.NFT}
          label="To NFT"
        />
      </div>

      {chosenStreamType === CreationStream.NFT && (
        <StreamToNFT onFormCancel={onFormCancel} onFormSubmit={onFormSubmit} submitting={false} />
      )}
      {chosenStreamType === CreationStream.Wallet && (
        <StreamToWallet
          onFormCancel={onFormCancel}
          onFormSubmit={onFormSubmit}
          submitting={false}
        />
      )}
    </div>
  );
};
