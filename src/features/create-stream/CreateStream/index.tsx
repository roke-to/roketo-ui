import cn from 'classnames';
import {useStore} from 'effector-react';
import {Field, Formik} from 'formik';
import React, {useState} from 'react';

import {$tokens} from '~/entities/wallet';

import {Balance, DisplayMode} from '~/shared/components/Balance';
import {FormikCheckbox} from '~/shared/components/FormikCheckbox';
import {FormikInput} from '~/shared/components/FormikInput';
import {FormikTextArea} from '~/shared/components/FormikTextArea';
import {env} from '~/shared/config';
import {testIds} from '~/shared/constants';

import {Button, DisplayMode as ButtonDisplayMode, ButtonType} from '@ui/components/Button';
import {ErrorSign} from '@ui/icons/ErrorSign';

import {CliffPeriodPicker} from '../CliffPeriodPicker';
import {ColorPicker} from '../ColorPicker';
import {COMMENT_TEXT_LIMIT, FormValues, INITIAL_FORM_VALUES, StreamColor} from '../constants';
import {getStreamingSpeed} from '../lib';
import {StreamSpeedCalcField} from '../StreamSpeedCalcField';
import {TokenSelector} from '../TokenSelector';
import {formValidationSchema} from './model';
import styles from './styles.module.scss';

type CreateStreamProps = {
  onFormSubmit: (values: FormValues) => Promise<void>;
  onFormCancel: () => void;
};

const DELAYED_DESCRIPTION = (
  <div>
    Delayed start
    <div className={styles.subDescription}>
      Select this if you want the stream not to start immediately,
      <br />
      you'll need to start it manually from stream page
      <br />
      (streams with cliff cannot be delayed)
    </div>
  </div>
);

const LOCK_DESCRIPTION = (
  <div>
    Uneditable stream
    <div className={styles.subDescription}>
      If you select this field, you will not be able
      <br />
      to carry out any actions on the stream
    </div>
  </div>
);

export const CreateStream = ({onFormCancel, onFormSubmit}: CreateStreamProps) => {
  const tokens = useStore($tokens);
  const [submitError, setError] = useState<Error | null>(null);

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
          const {meta: tokenMeta, formatter, roketoMeta} = token;

          const onChoose = async (fieldName: string, value: any) => {
            await setFieldValue(fieldName, value, false);
            await setFieldTouched(fieldName, true, false);
            validateField(fieldName);
          };

          const meaningfulSpeed = getStreamingSpeed(values.speed, token);

          return (
            <form onSubmit={handleSubmit} className={styles.form}>
              <Field
                isRequired
                name="receiver"
                label="Receiver:"
                component={FormikInput}
                placeholder={`receiver.${env.ACCOUNT_SUFFIX}`}
                className={cn(styles.formBlock, styles.receiver)}
                data-testid={testIds.createStreamReceiverInput}
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
                name="color"
                label="Color:"
                component={ColorPicker}
                className={cn(styles.formBlock, styles.color)}
                onChoose={(color: StreamColor) => onChoose('color', color)}
              />
              <Field
                isRequired
                name="deposit"
                label="Amount to stream:"
                component={FormikInput}
                placeholder="Amount to stream"
                className={cn(styles.formBlock, styles.deposit)}
                description={
                  <Balance tokenAccountId={activeTokenAccountId} mode={DisplayMode.CRYPTO} />
                }
                data-testid={testIds.createStreamAmountInput}
              />
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
                tokenAccountId={activeTokenAccountId}
                isRequired
                name="speed"
                label="Stream duration:"
                deposit={values.deposit}
                component={StreamSpeedCalcField}
                onSpeedChange={(speed: number) => onChoose('speed', speed)}
                className={cn(styles.formBlock, styles.duration)}
              />
              <Field
                maxLength={COMMENT_TEXT_LIMIT}
                name="comment"
                label="Comment:"
                placeholder="Enter comment"
                component={FormikTextArea}
                className={cn(styles.formBlock, styles.comment)}
                data-testid={testIds.createStreamCommentInput}
              />

              <Field
                name="delayed"
                disabled={Boolean(values.cliffDateTime)}
                description={DELAYED_DESCRIPTION}
                type="checkbox"
                component={FormikCheckbox}
                data-testid={testIds.createStreamDelayedCheckbox}
                className={cn(styles.formBlock, styles.delayed)}
              />

              <Field
                name="isLocked"
                description={LOCK_DESCRIPTION}
                type="checkbox"
                component={FormikCheckbox}
                data-testid={testIds.createStreamLockedCheckbox}
                className={cn(styles.formBlock, styles.isLocked)}
              />
              <div className={cn(styles.formBlock, styles.meaningfulSpeed)}>
                Streaming speed: {meaningfulSpeed}
              </div>
              {tokenMeta && (
                <div className={styles.feeDisclaimer}>
                  {`You will be charged
                    ${formatter.amount(roketoMeta.commission_on_create)}
                    ${tokenMeta.symbol} fee for the stream`}
                </div>
              )}
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
                >
                  Cancel
                </Button>

                <Button
                  type={ButtonType.submit}
                  displayMode={ButtonDisplayMode.action}
                  testId={testIds.createStreamSubmitButton}
                >
                  Create
                </Button>
              </div>
            </form>
          );
        }}
      </Formik>
    </div>
  );
};
