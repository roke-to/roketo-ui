import cn from 'classnames';
import {useStore} from 'effector-react';
import {useCallback, useState} from 'react';

import {CreateStream} from '~/features/create-stream/CreateStream';
import {WithdrawAllButton} from '~/features/stream-control/WithdrawAllButton';

import {STREAM_DIRECTION, StreamDirection} from '~/shared/api/roketo/constants';
import {Modal} from '~/shared/components/Modal';
import {testIds} from '~/shared/constants';
import {ProgressBar} from '~/shared/ui/components/ProgressBar';

import {Button} from '@ui/components/Button';
import {Layout} from '@ui/components/Layout';

import {$financialStatus, handleCreateStreamFx} from './model';
import {StreamFilters} from './StreamFilters';
import {StreamsList} from './StreamsList';
import styles from './styles.module.scss';

const FinancialInfo = ({
  title,
  total,
  streamed = 0,
  withdrawn = 0,
  withProgressBar = true,
  testId,
  direction = null,
}: {
  title: string;
  total: number;
  streamed?: number;
  withdrawn?: number;
  withProgressBar?: boolean;
  testId?: string;
  direction?: StreamDirection | null;
}) => (
  <div className={styles.infoCard}>
    <h3 className={styles.infoTitle}>{title}</h3>

    <span className={styles.finance} data-testid={testId}>
      {streamed ? `$ ${streamed} of ${total}` : `$ ${total}`}
    </span>

    {withProgressBar && (
      <ProgressBar
        total={String(total)}
        streamed={String(streamed)}
        withdrawn={String(withdrawn)}
        direction={direction}
      />
    )}
  </div>
);

export const StreamsPage = () => {
  const [isModalOpened, setIsModalOpened] = useState<boolean>(false);
  const toggleModal = useCallback(
    () => setIsModalOpened(!isModalOpened),
    [setIsModalOpened, isModalOpened],
  );

  const submitting = useStore(handleCreateStreamFx.pending);

  const {outcomeAmountInfo, incomeAmountInfo, availableForWithdrawal} = useStore($financialStatus);

  return (
    <div className={styles.root}>
      <Layout>
        <section className={cn(styles.flex, styles.header)}>
          <h1 className={styles.pageTitle}>Streams</h1>

          <div className={cn(styles.flex, styles.buttonsWrapper)}>
            <WithdrawAllButton />

            <Button onClick={toggleModal} testId={testIds.createStreamButton}>
              Create a stream
            </Button>
            <Modal isOpen={isModalOpened} onCloseModal={toggleModal}>
              <CreateStream
                onFormCancel={toggleModal}
                onFormSubmit={(values) =>
                  handleCreateStreamFx(values).then(() => setIsModalOpened(false))
                }
                submitting={submitting}
              />
            </Modal>
          </div>
        </section>

        <section className={styles.financialStatus}>
          <FinancialInfo
            title="Sending"
            total={outcomeAmountInfo.total}
            streamed={outcomeAmountInfo.streamed}
            withdrawn={outcomeAmountInfo.withdrawn}
            direction={STREAM_DIRECTION.OUT}
          />

          <FinancialInfo
            title="Receiving"
            total={incomeAmountInfo.total}
            streamed={incomeAmountInfo.streamed}
            withdrawn={incomeAmountInfo.withdrawn}
            direction={STREAM_DIRECTION.IN}
          />

          <FinancialInfo
            title="Available for withdrawal"
            total={availableForWithdrawal}
            withProgressBar={false}
            testId={testIds.availableForWithdrawalCaption}
          />
        </section>

        <StreamFilters className={styles.streamFilters} />

        <StreamsList className={styles.section} onCreateStreamClick={toggleModal} />
      </Layout>
    </div>
  );
};
