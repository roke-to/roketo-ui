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

import {handleCreateTransferToNFTFx} from '../nft_transfers/model';
import {handleCreateStreamFx} from '../streams/model';
import {$financialStatus, handleCreateStreamToNFTFx} from './model';
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
  className,
}: {
  title: string;
  total: number;
  streamed?: number;
  withdrawn?: number;
  withProgressBar?: boolean;
  testId?: string;
  direction?: StreamDirection | null;
  className?: string;
}) => (
  <div className={cn(styles.infoCard, className)}>
    <h3 className={styles.infoTitle}>{title}</h3>

    <span className={withProgressBar ? styles.finance : styles.financeLarge} data-testid={testId}>
      {streamed ? `$ ${streamed} of ${total}` : `$ ${total}`}
    </span>

    {withProgressBar && (
      <ProgressBar
        total={String(total)}
        streamed={String(streamed)}
        withdrawn={String(withdrawn)}
        direction={direction}
        className={styles.progressBar}
      />
    )}
  </div>
);

export const NftStreamsPage = () => {
  const [isModalOpened, setIsModalOpened] = useState<boolean>(false);
  const toggleModal = useCallback(
    () => setIsModalOpened(!isModalOpened),
    [setIsModalOpened, isModalOpened],
  );

  const {outcomeAmountInfo, incomeAmountInfo, availableForWithdrawal} = useStore($financialStatus);

  return (
    <div className={styles.layout}>
      <div className={cn(styles.shadowCard, styles.sendingReceivingStatus)}>
        <FinancialInfo
          title="Sending"
          total={outcomeAmountInfo.total}
          streamed={outcomeAmountInfo.streamed}
          withdrawn={outcomeAmountInfo.withdrawn}
          direction={STREAM_DIRECTION.OUT}
          className={styles.sendingCard}
        />

        <FinancialInfo
          title="Receiving"
          total={incomeAmountInfo.total}
          streamed={incomeAmountInfo.streamed}
          withdrawn={incomeAmountInfo.withdrawn}
          direction={STREAM_DIRECTION.IN}
          className={styles.receivingCard}
        />
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
      </div>

      <div className={cn(styles.shadowCard, styles.withdrawalStatus)}>
        <FinancialInfo
          title="Available for withdrawal"
          total={availableForWithdrawal}
          withProgressBar={false}
          testId={testIds.availableForWithdrawalCaption}
        />
        <WithdrawAllButton className={styles.button} />
      </div>

      <StreamFilters className={styles.streamFilters} />

      <StreamsList className={styles.streamListBlock} onCreateStreamClick={toggleModal} />
    </div>
  );
};
