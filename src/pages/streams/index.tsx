import cn from 'classnames';
import {useStoreMap} from 'effector-react';
import {useCallback, useState} from 'react';

import {FinancialStatus} from '~/widgets/financialStatus';
import {StreamsList} from '~/widgets/streamsList';

import {CreateMassStreaming} from '~/features/create-stream/CreateMassStreaming';
import {CreateStream} from '~/features/create-stream/CreateStream';
import {StreamFilters} from '~/features/filtering/StreamFilters';
import {WithdrawAllButton} from '~/features/stream-control/WithdrawAllButton';

import {$accountStreams} from '~/entities/wallet';

import {RoketoStream} from '~/shared/api/roketo/interfaces/entities';
import {LegacyModal} from '~/shared/components/LegacyModal';
import {Modal} from '~/shared/components/Modal';
import {testIds} from '~/shared/constants';

import {Button} from '@ui/components/Button';
import {Layout} from '@ui/components/Layout';

import {handleCreateMassStreamingFx, handleCreateStreamFx} from './model';
import styles from './styles.module.scss';

export const StreamsPage = () => {
  const allStreams = useStoreMap({
    store: $accountStreams,
    keys: [],
    fn: ({inputs, outputs}) => [...inputs, ...outputs],
  });

  const [filteredItems, setFiltered] = useState<RoketoStream[] | undefined>([]);
  const [isStreamCreationModalOpened, setIsStreamCreationModalOpened] = useState(false);
  const toggleStreamCreationModal = useCallback(
    () => setIsStreamCreationModalOpened((value) => !value),
    [],
  );

  const [isMassStreamingCreationModalOpened, setIsMassStreamingCreationModalOpened] =
    useState(false);
  const toggleMassStreamingCreationModal = useCallback(
    () => setIsMassStreamingCreationModalOpened((value) => !value),
    [],
  );

  return (
    <div className={styles.root}>
      <Layout>
        <section className={cn(styles.flex, styles.header)}>
          <h1 className={styles.title}>Streams</h1>

          <div className={cn(styles.flex, styles.buttonsWrapper)}>
            <WithdrawAllButton />

            <Button onClick={toggleStreamCreationModal} testId={testIds.createStreamButton}>
              Create a stream
            </Button>
            <LegacyModal
              isOpen={isStreamCreationModalOpened}
              onCloseModal={toggleStreamCreationModal}
            >
              <CreateStream
                onFormCancel={toggleStreamCreationModal}
                onFormSubmit={handleCreateStreamFx}
              />
            </LegacyModal>

            <Button onClick={toggleMassStreamingCreationModal}>Create a mass streaming</Button>
            <Modal
              isOpen={isMassStreamingCreationModalOpened}
              onCloseModal={toggleMassStreamingCreationModal}
              className={styles.massStreamingModal}
              title="Create a mass streaming"
            >
              <CreateMassStreaming
                onFormCancel={toggleMassStreamingCreationModal}
                onFormSubmit={handleCreateMassStreamingFx}
              />
            </Modal>
          </div>
        </section>

        <FinancialStatus />

        <StreamFilters
          items={allStreams}
          onFilterDone={setFiltered}
          className={styles.streamFilters}
        />

        <StreamsList
          displayingStreams={filteredItems}
          className={styles.section}
          onCreateStreamClick={toggleStreamCreationModal}
        />
      </Layout>
    </div>
  );
};
