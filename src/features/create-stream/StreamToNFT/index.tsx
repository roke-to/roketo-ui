import {countStorageDeposit} from '@roketo/sdk';
import cn from 'classnames';
import {useStore} from 'effector-react';
import {Field, Formik} from 'formik';
import React, {useState} from 'react';

import {handleCreateStreamFx} from '~/pages/streams/model';

import {$accountId, $listedTokens} from '~/entities/wallet';

import {Balance, DisplayMode} from '~/shared/components/Balance';
import {FormikCheckbox} from '~/shared/components/FormikCheckbox';
import {FormikInput} from '~/shared/components/FormikInput';
import {FormikTextArea} from '~/shared/components/FormikTextArea';
import {FormikToggle} from '~/shared/components/FormikToggle';
import {env} from '~/shared/config';

import {Button, DisplayMode as ButtonDisplayMode, ButtonType} from '@ui/components/Button';
import {ErrorSign} from '@ui/icons/ErrorSign';

import {CliffPeriodPicker} from '../CliffPeriodPicker';
import {ColorPicker} from '../ColorPicker';
import {CommissionDetails} from '../CommissionDetails';
import {
  COMMENT_TEXT_LIMIT,
  INITIAL_NFT_FORM_VALUES,
  NftFormValues,
  StreamColor,
} from '../constants';
import {StreamDurationCalcField} from '../StreamDurationCalcField';
import {TokenSelector} from '../TokenSelector';
import {ArrowIcon} from './ArrowIcon';
import {formValidationSchema} from './model';
import styles from './styles.module.scss';

type CreateStreamToWalleProps = {
  onFormSubmit: (values: NftFormValues) => Promise<void>;
  onFormCancel: () => void;
};

export const StreamToNFT = ({onFormCancel, onFormSubmit}: CreateStreamToWalleProps) => {
  const tokens = useStore($listedTokens);
  const accountId = useStore($accountId);
  const [submitError, setError] = useState<Error | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [streamAmount, setStreamAmount] = useState(0);
  const [deposit, setDeposit] = useState(0);

  const submitting = useStore(handleCreateStreamFx.pending);

  const handleFormSubmit = (formValues: NftFormValues) => {
    onFormSubmit(formValues).catch((error) => setError(error));
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

        const handleReceiverChanged = async (event: React.FormEvent<HTMLFormElement>) => {
          const receiverTokenAccountId = (event.target as HTMLInputElement).value;
          const {tokenContract} = token;

          const storageDepositAccountIds = [accountId || '', receiverTokenAccountId];

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
              disabled={Boolean(values.cliffDateTime)}
              component={FormikToggle}
              className={cn(styles.formBlock, styles.start)}
              description="Start immediately"
              hint={
                values.isNotDelayed
                  ? 'The stream will start immediately'
                  : 'You can start stream manually later'
              }
              isChecked={values.cliffDateTime ? false : values.isNotDelayed}
              onDelayedChange={(isNotDelayed: boolean) => onChoose('isNotDelayed', isNotDelayed)}
            />

            <Field
              isRequired
              name="nftContractId"
              label="NFT Contract"
              component={FormikInput}
              placeholder={`receiver.${env.ACCOUNT_SUFFIX}`}
              className={cn(styles.formBlock, styles.receiver)}
              onBlur={handleReceiverChanged}
            />

            <Field
              isRequired
              name="nftId"
              label="NFT ID"
              component={FormikInput}
              placeholder="0"
              className={cn(styles.formBlock, styles.nftId)}
              onBlur={handleReceiverChanged}
            />

            <Field
              name="color"
              label="Add tag"
              component={ColorPicker}
              className={cn(styles.formBlock, styles.color)}
              onChoose={(color: StreamColor) => onChoose('color', color, true)}
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

            <Field
              isRequired
              name="duration"
              label="Stream duration"
              component={StreamDurationCalcField}
              onDurationChange={(duration: number) => onChoose('duration', duration, true)}
              className={cn(styles.formBlock, styles.duration)}
            />

            <Field
              maxLength={COMMENT_TEXT_LIMIT}
              name="comment"
              label="Comment"
              placeholder="You can type something to highlight the stream"
              component={FormikTextArea}
              className={cn(styles.formBlock, styles.comment)}
            />

            <div className={styles.collapseBtnWrap}>
              <button
                type="button"
                className={styles.collapseBtn}
                onClick={() => setIsCollapsed(!isCollapsed)}
              >
                {!isCollapsed && 'More options'}
                {isCollapsed && 'Less options'}
                <ArrowIcon className={isCollapsed ? styles.rotated : ''} />
              </button>
            </div>

            {isCollapsed && (
              <>
                <Field
                  name="cliffDateTime"
                  label="Cliff period"
                  component={CliffPeriodPicker}
                  onCliffDateTimeChange={(cliffDateTime: Date | null) =>
                    onChoose('cliffDateTime', cliffDateTime, true)
                  }
                  className={cn(styles.formBlock, styles.cliff)}
                />
                <Field
                  name="isUnlocked"
                  description="Edited stream"
                  type="checkbox"
                  component={FormikCheckbox}
                  className={cn(styles.formBlock, styles.isUnlocked)}
                />
              </>
            )}

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
                  disabled={submitting}
                >
                  Cancel
                </Button>

                <Button
                  type={ButtonType.submit}
                  displayMode={ButtonDisplayMode.action}
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
