import cn from 'classnames';
import {useStore} from 'effector-react';
import {Field, Formik} from 'formik';
import React, {useState} from 'react';

import {$accountId, $listedTokens} from '~/entities/wallet';

import {countStorageDeposit} from '~/shared/api/methods';
import {formatAmount} from '~/shared/api/token-formatter';
import {Balance, DisplayMode} from '~/shared/components/Balance';
import {FormikCheckbox} from '~/shared/components/FormikCheckbox';
import {FormikInput} from '~/shared/components/FormikInput';
import {FormikTextArea} from '~/shared/components/FormikTextArea';
import {FormikToggle} from '~/shared/components/FormikToggle';
import {env} from '~/shared/config';
import {testIds} from '~/shared/constants';

import {Button, DisplayMode as ButtonDisplayMode, ButtonType} from '@ui/components/Button';
import {ErrorSign} from '@ui/icons/ErrorSign';

import {CliffPeriodPicker} from '../CliffPeriodPicker';
import {ColorPicker} from '../ColorPicker';
import {COMMENT_TEXT_LIMIT, FormValues, INITIAL_FORM_VALUES, StreamColor} from '../constants';
import {StreamDurationCalcField} from '../StreamDurationCalcField';
import {TokenSelector} from '../TokenSelector';
import {ArrowIcon} from './ArrowIcon';
import {formValidationSchema} from './model';
import styles from './styles.module.scss';

type CommissionDetailsProps = {
  amount: number;
  tokenSymbol: string;
  tokenDecimals: number;
  commission: number | string;
  deposit: number;
};

const CommissionDetails = ({
  amount,
  tokenSymbol,
  tokenDecimals,
  commission,
  deposit,
}: CommissionDetailsProps) => (
  <div className={styles.commissionBlock}>
    <div className={styles.commissionTitle}>Total amount and fee: </div>
    <div className={styles.commissionWrap}>
      <div>Amount to be streamed</div>
      <div>
        {amount} {tokenSymbol}
      </div>
      <div>Stream creation fee</div>
      <div>{formatAmount(tokenDecimals, commission)} NEAR</div>
      <div>Storage deposit fee</div>
      <div>{deposit} NEAR</div>
    </div>
  </div>
);

type CreateStreamProps = {
  onFormSubmit: (values: FormValues) => Promise<void>;
  onFormCancel: () => void;
  submitting: boolean;
};

export const CreateStream = ({onFormCancel, onFormSubmit, submitting}: CreateStreamProps) => {
  const tokens = useStore($listedTokens);
  const [submitError, setError] = useState<Error | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [streamAmount, setStreamAmount] = useState(0);
  const [deposit, setDeposit] = useState(0);
  const accountId = useStore($accountId);

  const handleFormSubmit = (formValues: FormValues) => {
    onFormSubmit(formValues).catch((error) => setError(error));
  };
  return (
    <div className={styles.root}>
      <h2 className={styles.title}>Create Stream</h2>

      <Formik
        initialValues={INITIAL_FORM_VALUES}
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
            });

            setDeposit(depositSum.toNumber() / 10 ** 24);
          };

          const handleAmountChanged = (event: React.FormEvent<HTMLFormElement>) => {
            setStreamAmount(Number((event.target as HTMLInputElement).value));
          };

          if (!token) return null;
          const {meta: tokenMeta, commission} = token;

          const onChoose = async (fieldName: string, value: any) => {
            await setFieldValue(fieldName, value, false);
            await setFieldTouched(fieldName, true, false);
            validateField(fieldName);
          };

          return (
            <form onSubmit={handleSubmit} className={styles.form}>
              <Field
                name="isNotDelayed"
                disabled={Boolean(values.cliffDateTime)}
                component={FormikToggle}
                data-testid={testIds.createStreamDelayedCheckbox}
                className={cn(styles.formBlock, styles.start)}
                description="Start immediately"
                hint={
                  values.isNotDelayed
                    ? 'The stream will start immediately'
                    : 'You can start stream manualy later'
                }
                checked={values.cliffDateTime ? false : values.isNotDelayed}
              />

              <Field
                isRequired
                name="receiver"
                label="Receiver"
                component={FormikInput}
                placeholder={`receiver.${env.ACCOUNT_SUFFIX}`}
                className={cn(styles.formBlock, styles.receiver)}
                data-testid={testIds.createStreamReceiverInput}
                onBlur={handleReceiverChanged}
              />

              <Field
                name="color"
                label="Add tag"
                component={ColorPicker}
                className={cn(styles.formBlock, styles.color)}
                onChoose={(color: StreamColor) => onChoose('color', color)}
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
                onTokenChoose={(tokenAccountId: string) => onChoose('token', tokenAccountId)}
                component={TokenSelector}
                className={cn(styles.formBlock, styles.token)}
              />

              <Field
                isRequired
                name="duration"
                label="Stream duration"
                component={StreamDurationCalcField}
                onDurationChange={(duration: number) => onChoose('duration', duration)}
                className={cn(styles.formBlock, styles.duration)}
              />

              <Field
                maxLength={COMMENT_TEXT_LIMIT}
                name="comment"
                label="Comment"
                placeholder="You can type something to highlight the stream"
                component={FormikTextArea}
                className={cn(styles.formBlock, styles.comment)}
                data-testid={testIds.createStreamCommentInput}
              />

              <div className={styles.collapseBtnWrap}>
                <button
                  type="button"
                  className={styles.collapseBtn}
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  data-testid={testIds.collapseButton}
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
                      onChoose('cliffDateTime', cliffDateTime)
                    }
                    className={cn(styles.formBlock, styles.cliff)}
                  />
                  <Field
                    name="isUnlocked"
                    description="Edited stream"
                    type="checkbox"
                    component={FormikCheckbox}
                    data-testid={testIds.createStreamLockedCheckbox}
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

              <div className={cn(styles.formBlock, styles.actionButtonsWrapper)}>
                {submitError && (
                  <div className={styles.submitError}>
                    <ErrorSign />
                    <span>{submitError.message}</span>
                  </div>
                )}

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
                  testId={testIds.createStreamSubmitButton}
                  disabled={submitting}
                >
                  {submitting ? 'Creating...' : 'Create'}
                </Button>
              </div>
            </form>
          );
        }}
      </Formik>
    </div>
  );
};
