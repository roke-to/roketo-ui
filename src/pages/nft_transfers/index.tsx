import cn from 'classnames';
import {useCallback, useState} from 'react';

import {CreateStream} from '~/features/create-stream/CreateStream';

import {Modal} from '~/shared/components/Modal';
import {testIds} from '~/shared/constants';

import {Button} from '@ui/components/Button';

import {handleCreateStreamToNFTFx} from '../nft_streams/model';
import {handleCreateStreamFx} from '../streams/model';
import {handleCreateTransferToNFTFx} from './model';
import {StreamFilters} from './StreamFilters';
import {StreamsList} from './StreamsList';
import styles from './styles.module.scss';

export const NftTransfersPage = () => {
  const [isModalOpened, setIsModalOpened] = useState<boolean>(false);
  const toggleModal = useCallback(
    () => setIsModalOpened(!isModalOpened),
    [setIsModalOpened, isModalOpened],
  );

  return (
    <div className={styles.layout}>
      <Button
        className={cn(styles.button, styles.createStreamButton)}
        onClick={toggleModal}
        testId={testIds.createStreamButton}
      >
        Create a stream
      </Button>
      <Modal isOpen={isModalOpened} onCloseModal={toggleModal}>
        <CreateStream
          onFormCancel={toggleModal}
          onNftFormSubmit={(values) =>
            handleCreateTransferToNFTFx(values).then(() => setIsModalOpened(false))
          }
          onStreamToNftFormSubmit={(values) =>
            handleCreateStreamToNFTFx(values).then(() => setIsModalOpened(false))
          }
          onFormSubmit={(values) =>
            handleCreateStreamFx(values).then(() => setIsModalOpened(false))
          }
        />
      </Modal>

      <StreamFilters className={styles.streamFilters} />

      <StreamsList className={styles.streamListBlock} onCreateStreamClick={toggleModal} />
    </div>
  );
};
