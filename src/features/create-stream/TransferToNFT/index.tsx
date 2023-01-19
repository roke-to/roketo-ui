import {countStorageDeposit} from '@roketo/sdk';
import cn from 'classnames';
import {useStore} from 'effector-react';
import {Field, Formik} from 'formik';
import React, {useState} from 'react';

import {handleCreateTransferToNFTFx} from '~/pages/nft_transfers/model';

import {$accountId, $listedTokens} from '~/entities/wallet';

import {Balance, DisplayMode} from '~/shared/components/Balance';
import {FormikInput} from '~/shared/components/FormikInput';
import {FormikToggle} from '~/shared/components/FormikToggle';
import {env} from '~/shared/config';
import {testIds} from '~/shared/constants';

import {Button, DisplayMode as ButtonDisplayMode, ButtonType} from '@ui/components/Button';
import {ErrorSign} from '@ui/icons/ErrorSign';

import {CommissionDetails} from '../CommissionDetails';
import {INITIAL_NFT_FORM_VALUES, NftFormValues} from '../constants';
import {TokenSelector} from '../TokenSelector';
import {formValidationSchema} from './model';
import styles from './styles.module.scss';

type CreateSTransferToNFTProps = {
  onFormSubmit: (values: NftFormValues) => Promise<void>;
  onFormCancel: () => void;
};

export const TransferToNFT = ({onFormCancel, onFormSubmit}: CreateSTransferToNFTProps) => {
  const tokens = useStore($listedTokens);
  const accountId = useStore($accountId);
  const [submitError, setError] = useState<Error | null>(null);
  const [streamAmount, setStreamAmount] = useState(0);
  const [deposit, setDeposit] = useState(0);

  const submitting = useStore(handleCreateTransferToNFTFx.pending);

  const handleFormSubmit = (nftFormValues: NftFormValues) => {
    onFormSubmit(nftFormValues).catch((error) => setError(error));
  };

  return (
    <Formik
      initialValues={INITIAL_NFT_FORM_VALUES}
      onSubmit={handleFormSubmit}
      validateOnBlur
      validationSchema={formValidationSchema}
      validateOnChange={false}
      validateOnMount={false}
    >
      {({values, handleSubmit, setFieldValue, setFieldTouched, validateField}) => {
        const activeTokenAccountId = values.token;
        const token = tokens[activeTokenAccountId];

        const handleReceiverChanged = async () => {
          const {tokenContract} = token;

          const storageDepositAccountIds = [accountId || ''];

          const {depositSum} = await countStorageDeposit({
            tokenContract,
            storageDepositAccountIds,
            roketoContractName: env.ROKETO_CONTRACT_NAME,
            financeContractName: env.ROKETO_FINANCE_CONTRACT_NAME,
          });

          setDeposit(depositSum.toNumber() / 10 ** 24);
        };

        const handleAmountChanged = (event: React.FormEvent<HTMLFormElement>) => {
          setStreamAmount(Number((event.target as HTMLInputElement).value));
        };

        if (!token) return null;
        const {meta: tokenMeta, commission} = token;

        const onChoose = async (fieldName: string, value: any, validate?: boolean) => {
          await setFieldValue(fieldName, value, false);
          await setFieldTouched(fieldName, true, false);
          if (validate) validateField(fieldName);
        };

        return (
          <form onSubmit={handleSubmit} className={styles.form}>
            <Field
              name="isNotDelayed"
              disabled
              component={FormikToggle}
              testId={testIds.createStreamDelayedCheckbox}
              className={cn(styles.formBlock, styles.start)}
              description="Start immediately"
              hint="The stream will start immediately"
              isChecked
              onDelayedChange={(isNotDelayed: boolean) => onChoose('isNotDelayed', isNotDelayed)}
            />

            <Field
              isRequired
              name="nftContractId"
              label="NFT Contract"
              component={FormikInput}
              placeholder={`receiver.${env.ACCOUNT_SUFFIX}`}
              className={cn(styles.formBlock, styles.receiver)}
              data-testid={testIds.createStreamReceiverInput}
              onBlur={handleReceiverChanged}
            />

            <Field
              isRequired
              name="nftId"
              label="NFT ID"
              component={FormikInput}
              placeholder="0"
              className={cn(styles.formBlock, styles.nftId)}
              data-testid={testIds.createStreamReceiverInput}
              onBlur={handleReceiverChanged}
            />

            <Field
              isRequired
              name="deposit"
              label="Amount to stream"
              component={FormikInput}
              placeholder="Amount to stream"
              className={cn(styles.formBlock, styles.deposit)}
              onBlur={handleAmountChanged}
              description={
                <Balance tokenAccountId={activeTokenAccountId} mode={DisplayMode.CRYPTO} />
              }
              data-testid={testIds.createStreamAmountInput}
            />

            <Field
              isRequired
              name="token"
              label="Token"
              activeTokenAccountId={values.token}
              onTokenChoose={(tokenAccountId: string) => onChoose('token', tokenAccountId, true)}
              component={TokenSelector}
              className={cn(styles.formBlock, styles.token)}
            />

            <CommissionDetails
              amount={streamAmount}
              tokenSymbol={token.meta.symbol}
              tokenDecimals={tokenMeta.decimals}
              commission={commission}
              deposit={deposit}
            />

            <div className={cn(styles.formBlock, styles.actionControlsWrapper)}>
              {submitError && (
                <div className={styles.submitError}>
                  <ErrorSign />
                  <span>{submitError.message}</span>
                </div>
              )}

              <div className={styles.actionButtonsWrapper}>
                <Button
                  displayMode={ButtonDisplayMode.simple}
                  onClick={onFormCancel}
                  testId={testIds.createStreamCancelButton}
                  disabled={submitting}
                >
                  Cancel
                </Button>

                <Button
                  type={ButtonType.submit}
                  displayMode={ButtonDisplayMode.action}
                  testId={testIds.createTransferToNFTSubmitButton}
                  disabled={submitting}
                >
                  {submitting ? 'Creating...' : 'Create'}
                </Button>
              </div>
            </div>
          </form>
        );
      }}
    </Formik>
  );
};
