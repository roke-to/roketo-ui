import React, {useMemo, useState, useCallback} from 'react';
import cn from 'classnames';

import {Layout} from '@ui/components/Layout';
import {Button} from '@ui/components/Button';
import {Modal} from '@ui/components/Modal';

import {WithdrawAllButton} from 'features/stream-control/WithdrawAllButton';
import {useStreams} from 'features/roketo-resource';
import {StreamFilters} from 'features/filtering/StreamFilters';
import {CreateStream} from 'features/create-stream/CreateStream';

import {FinancialStatus} from 'widgets/financialStatus';
import {StreamsList} from 'widgets/streamsList';

import {RoketoStream} from 'shared/api/roketo/interfaces/entities';

import styles from './styles.module.scss';

export const MyStreamsPage = () => {
  const [filteredItems, setFiltered] = useState<RoketoStream[] | undefined>([]);

  const {data: streams} = useStreams();
  const {inputs, outputs} = streams || {};

  const allStreams = useMemo<RoketoStream[] | undefined>(
    () => ((inputs || outputs) && [...(inputs || []), ...(outputs || [])]),
    [inputs, outputs]
  );

  const [isModalOpened, setIsModalOpened] = useState<boolean>(true);
  const toggleModal = useCallback(
    () => setIsModalOpened(!isModalOpened),
    [setIsModalOpened, isModalOpened]
  );

  return (
    <div className={styles.root}>
      <Layout>
        <section className={cn(styles.flex, styles.spaceBetween)}>
          <h1 className={styles.title}>Streams</h1>

          <div className={cn(styles.flex, styles.buttonsWrapper)}>
            <WithdrawAllButton>Withdraw tokens</WithdrawAllButton>

            <Button onClick={toggleModal}>Create stream</Button>
          </div>
        </section>

        <FinancialStatus className={styles.section}/>

        <StreamFilters
          items={allStreams}
          onFilterDone={setFiltered}
        />

        {filteredItems &&
          <StreamsList streams={filteredItems} className={styles.section}/>
        }

        <Modal isOpen={isModalOpened} onCloseModal={toggleModal}>
          <CreateStream />
        </Modal>
      </Layout>
    </div>
  );
};

export default MyStreamsPage;

