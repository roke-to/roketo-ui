import cn from 'classnames';
import {useStore} from 'effector-react';
import {Field, Formik} from 'formik';
import {useCallback, useState} from 'react';

import {CreateStream} from '~/features/create-stream/CreateStream';
import {withdrawNFTx} from '~/features/stream-control/WithdrawAllButton/model';

import {FormikInput} from '~/shared/components/FormikInput';
import {Modal} from '~/shared/components/Modal';
import {env} from '~/shared/config';
import {testIds} from '~/shared/constants';

import {Button, DisplayMode as ButtonDisplayMode, ButtonType} from '@ui/components/Button';

import {handleCreateTransferToNFTFx} from '../nft_transfers/model';
import {handleCreateStreamFx} from '../streams/model';
import {handleCreateStreamToNFTFx, withdrawFormValidationSchema} from './model';
import {StreamFilters} from './StreamFilters';
import {StreamsList} from './StreamsList';
import styles from './styles.module.scss';

export const NftStreamsPage = () => {
  const INITIAL_VALUES = {};
  const [isWithdrawModalOpened, setIsWithdrawModalOpened] = useState<boolean>(false);
  const toggleWithdrawModal = useCallback(
    () => setIsWithdrawModalOpened(!isWithdrawModalOpened),
    [setIsWithdrawModalOpened, isWithdrawModalOpened],
  );
  const [isModalOpened, setIsModalOpened] = useState<boolean>(false);
  const toggleModal = useCallback(
    () => setIsModalOpened(!isModalOpened),
    [setIsModalOpened, isModalOpened],
  );
  console.log('NftStreamsPage');
  // const [submitError, setError] = useState<Error | null>(null);
  const handleWithdraw = (e: any) => {
    withdrawNFTx({
      nftContractId: e.nftContractId,
      nftId: e.nftId,
      fungibleToken: e.fungibleToken,
    });
  };

  const submitting = useStore(withdrawNFTx.pending);

  return (
    <div className={styles.layout}>
      <div className={cn(styles.shadowCard, styles.sendingReceivingStatus)}>
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
        <Button
          className={cn(styles.button, styles.createStreamButton)}
          onClick={toggleWithdrawModal}
        >
          Withdraw a stream
        </Button>
        <Modal isOpen={isWithdrawModalOpened} onCloseModal={toggleWithdrawModal}>
          <h2 className={styles.title}>Withdraw a stream</h2>
          <Formik
            initialValues={INITIAL_VALUES}
            onSubmit={handleWithdraw}
            validateOnBlur
            validationSchema={withdrawFormValidationSchema}
            validateOnChange={false}
            validateOnMount={false}
          >
            {({
              // values,
              handleSubmit,
              // setFieldValue,
              // setFieldTouched,
              // validateField
            }) => (
              <form onSubmit={handleSubmit} className={styles.form}>
                <Field
                  isRequired
                  name="nftContractId"
                  label="NFT Contract"
                  component={FormikInput}
                  placeholder={`receiver.${env.ACCOUNT_SUFFIX}`}
                  className={cn(styles.formBlock, styles.receiver)}
                />

                <Field
                  isRequired
                  name="nftId"
                  label="NFT ID"
                  component={FormikInput}
                  placeholder="0"
                  className={cn(styles.formBlock, styles.nftId)}
                />
                <Field
                  isRequired
                  name="fungibleToken"
                  label="Fungible Token ID"
                  component={FormikInput}
                  placeholder={`wrap.${env.ACCOUNT_SUFFIX}`}
                  className={cn(styles.formBlock, styles.nftId)}
                />

                <div className={cn(styles.formBlock, styles.actionControlsWrapper)}>
                  {/* {submitError && (
                      <div className={styles.submitError}>
                        <ErrorSign />
                        <span>{submitError.message}</span>
                      </div>
                    )} */}

                  <div className={styles.actionButtonsWrapper}>
                    <Button onClick={toggleWithdrawModal} disabled={submitting}>
                      Cancel
                    </Button>

                    <Button
                      type={ButtonType.submit}
                      displayMode={ButtonDisplayMode.action}
                      disabled={submitting}
                    >
                      {submitting ? 'Withdrawing...' : 'Withdraw'}
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </Formik>
        </Modal>
      </div>

      <StreamFilters className={styles.streamFilters} />

      <StreamsList className={styles.streamListBlock} onCreateStreamClick={toggleModal} />
    </div>
  );
};
