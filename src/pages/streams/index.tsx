import React, {useMemo, useState, useCallback} from 'react';
import {generatePath} from 'react-router-dom';
import cn from 'classnames';

import {Layout} from '@ui/components/Layout';
import {Button} from '@ui/components/Button';

import {Modal} from 'shared/components/Modal';

import {useRoketoContext} from 'app/roketo-context';

import {WithdrawAllButton} from 'features/stream-control/WithdrawAllButton';
import {useStreams} from 'features/roketo-resource';
import {StreamFilters} from 'features/filtering/StreamFilters';
import {CreateStream, type FormValues} from 'features/create-stream/CreateStream';
import {FinancialStatus} from 'widgets/financialStatus';
import {StreamsList} from 'widgets/streamsList';

import {RoketoStream} from 'shared/api/roketo/interfaces/entities';
import {ROUTES_MAP} from 'shared/helpers/routing';
import { testIds } from 'shared/constants';

import styles from './styles.module.scss';

const redirectUrl = generatePath(ROUTES_MAP.streams.path);
const returnPath = `${window.location.origin}/#${redirectUrl}`;

export const StreamsPage = () => {
  const {roketo, tokens} = useRoketoContext();

  const {data: streams} = useStreams();
  const {inputs, outputs} = streams || {};
  const allStreams = useMemo<RoketoStream[] | undefined>(
    () => ((inputs || outputs) && [...(inputs || []), ...(outputs || [])]),
    [inputs, outputs]
  );

  const [filteredItems, setFiltered] = useState<RoketoStream[] | undefined>([]);
  const [isModalOpened, setIsModalOpened] = useState<boolean>(false);
  const toggleModal = useCallback(
    () => setIsModalOpened(!isModalOpened),
    [setIsModalOpened, isModalOpened]
  );

  const handleCreateStream = async (values: FormValues) => {
    const {
      receiver,
      autoStart,
      comment,
      deposit,
      speed,
      token,
    } = values;

    const {formatter, api, roketoMeta} = tokens[token];

    await roketo.api.createStream({
      deposit: formatter.toYocto(deposit),
      comment,
      receiverId: receiver,
      tokenAccountId: token,
      commissionOnCreate: roketoMeta.commission_on_create,
      tokensPerSec: speed,
      isAutoStart: autoStart,
      callbackUrl: returnPath,
      handleTransferStream: api.transfer,
    });
  };

  return (
    <div className={styles.root}>
      <Layout>
        <section className={cn(styles.flex, styles.header)}>
          <h1 className={styles.title}>Streams</h1>

          <div className={cn(styles.flex, styles.buttonsWrapper)}>
            <WithdrawAllButton>Withdraw tokens</WithdrawAllButton>

            <Button
              onClick={toggleModal}
              testId={testIds.createStreamButton}
            >
              Create a stream
            </Button>
            <Modal isOpen={isModalOpened} onCloseModal={toggleModal}>
              <CreateStream onFormCancel={toggleModal} onFormSubmit={handleCreateStream}/>
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
          onCreateStreamClick={toggleModal}
        />

      </Layout>
    </div>
  );
};
