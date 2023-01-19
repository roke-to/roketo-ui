import cn from 'classnames';
import {useState} from 'react';

import {CreateStreamProps} from '../constants';
import {StreamToNFT} from '../StreamToNFT';
import {StreamToWallet} from '../StreamToWallet';
import {TransferToNFT} from '../TransferToNFT';
import styles from './styles.module.scss';

type ButtonProps = {
  onClick: () => void;
  isActive: boolean;
  label: string;
};

enum TransactionType {
  STREAM = 'STREAM',
  TRANSFER_TO_NFT = 'TRANSFER_TO_NFT',
  STREAM_TO_NFT = 'STREAM_TO_NFT',
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
  const [chosenStreamType, setChosenStreamType] = useState(TransactionType.STREAM);

  return (
    <div className={styles.root}>
      <h2 className={styles.title}>Create Stream</h2>

      <div className={styles.tabs}>
        <TabButton
          onClick={() => setChosenStreamType(TransactionType.STREAM)}
          isActive={chosenStreamType === TransactionType.STREAM}
          label="Stream To Wallet"
        />
        <TabButton
          onClick={() => setChosenStreamType(TransactionType.TRANSFER_TO_NFT)}
          isActive={chosenStreamType === TransactionType.TRANSFER_TO_NFT}
          label="Transaction To NFT"
        />
        <TabButton
          onClick={() => setChosenStreamType(TransactionType.STREAM_TO_NFT)}
          isActive={chosenStreamType === TransactionType.STREAM_TO_NFT}
          label="Stream To NFT"
        />
      </div>

      {chosenStreamType === TransactionType.TRANSFER_TO_NFT && (
        <TransferToNFT onFormCancel={onFormCancel} onFormSubmit={onNftFormSubmit} />
      )}
      {chosenStreamType === TransactionType.STREAM && (
        <StreamToWallet onFormCancel={onFormCancel} onFormSubmit={onFormSubmit} />
      )}
      {chosenStreamType === TransactionType.STREAM_TO_NFT && (
        <StreamToNFT onFormCancel={onFormCancel} onFormSubmit={onFormSubmit} />
      )}
    </div>
  );
};
