import cn from 'classnames';
import {useStoreMap} from 'effector-react';
import {useCallback, useState} from 'react';

import {FinancialStatus} from '~/widgets/financialStatus';
import {StreamsList} from '~/widgets/streamsList';

import {CreateStream} from '~/features/create-stream/CreateStream';
import {StreamFilters} from '~/features/filtering/StreamFilters';
import {WithdrawAllButton} from '~/features/stream-control/WithdrawAllButton';

import {$accountStreams} from '~/entities/wallet';

import {RoketoStream} from '~/shared/api/roketo/interfaces/entities';
import {LegacyModal} from '~/shared/components/LegacyModal';
import {testIds} from '~/shared/constants';

import {Button} from '@ui/components/Button';
import {Layout} from '@ui/components/Layout';

import {handleCreateStreamFx} from './model';
import styles from './styles.module.scss';

export const StreamsPage = () => {
  const allStreams = useStoreMap({
    store: $accountStreams,
    keys: [],
    fn: ({inputs, outputs}) => [...inputs, ...outputs],
  });

  const [filteredItems, setFiltered] = useState<RoketoStream[] | undefined>([]);
  const [isModalOpened, setIsModalOpened] = useState<boolean>(false);
  const toggleModal = useCallback(
    () => setIsModalOpened(!isModalOpened),
    [setIsModalOpened, isModalOpened],
  );

  return (
    <div className={styles.root}>
      <Layout>
        <section className={cn(styles.flex, styles.header)}>
          <h1 className={styles.title}>Streams</h1>

          <div className={cn(styles.flex, styles.buttonsWrapper)}>
            <WithdrawAllButton />

            <Button onClick={toggleModal} testId={testIds.createStreamButton}>
              Create a stream
            </Button>
            <LegacyModal isOpen={isModalOpened} onCloseModal={toggleModal}>
              <CreateStream onFormCancel={toggleModal} onFormSubmit={handleCreateStreamFx} />
            </LegacyModal>
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
          onCreateStreamClick={toggleModal}
        />
      </Layout>
    </div>
  );
};
