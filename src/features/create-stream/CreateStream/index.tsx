import React, {useState} from 'react';
import cn from 'classnames';
import {Field, Formik} from 'formik';
import {useStore} from 'effector-react';

import {$tokens} from '~/entities/wallet';

import {Button, ButtonType, DisplayMode as ButtonDisplayMode} from '@ui/components/Button';
import {ErrorSign} from '@ui/icons/ErrorSign';

import {FormikInput} from '~/shared/components/FormikInput';
import {FormikCheckbox} from '~/shared/components/FormikCheckbox';
import {FormikTextArea} from '~/shared/components/FormikTextArea';
import {Balance, DisplayMode} from '~/shared/components/Balance';

import { testIds } from '~/shared/constants';

import {env} from '~/shared/config';
import {StreamSpeedCalcField} from '../StreamSpeedCalcField';
import {TokenSelector} from '../TokenSelector';
import { CliffPeriodPicker } from '../CliffPeriodPicker';

import {INITIAL_FORM_VALUES, COMMENT_TEXT_LIMIT} from '../constants';

import {formValidationSchema} from './model';

import styles from './styles.module.scss';

const Row = ({
  children,
  className,
}: {children: React.ReactNode, className?: string}) => (
  <div className={cn(styles.row, className)}>{children}</div>
);

export type FormValues = {
  receiver: string;
  streamName: string;
  delayed: boolean;
  comment: string;
  deposit: number;
  speed: number;
  token: string;
  isLocked: boolean;
  cliffDateTime: Date | null;
}

type CreateStreamProps = {
  onFormSubmit: (values: FormValues) => Promise<void>;
  onFormCancel: () => void;
}

const DELAYED_DESCRIPTION = (
  <div>
    Delayed start
    <div className={styles.subDescription}>
      Select this if you want the stream not to start immediately,<br />
      you'll need to start it manually from stream page<br />
      (streams with cliff cannot be delayed)
    </div>
  </div>
);

const LOCK_DESCRIPTION = (
  <div>
    Uneditable stream
    <div className={styles.subDescription}>
      If you select this field, you will not be able<br />to carry out any actions on the stream
    </div>
  </div>
);

export const CreateStream = ({onFormCancel, onFormSubmit}: CreateStreamProps) => {
  const tokens = useStore($tokens)
  const [submitError, setError] = useState<Error | null>(null);

  const handleFormSubmit = (formValues: FormValues) => {
    onFormSubmit(formValues)
      .catch(error => setError(error));
  }
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
        {({
          values,
          handleSubmit,
          setFieldValue,
          setFieldTouched,
          validateField,
        }) => {
          const activeTokenAccountId = values.token;

          const {meta: tokenMeta, formatter, roketoMeta} = tokens[activeTokenAccountId];

          return (
            <form onSubmit={handleSubmit} className={styles.form}>

              <Row>
                <Field
                  isRequired
                  name="receiver"
                  label="Receiver:"
                  component={FormikInput}
                  placeholder={`receiver.${env.ACCOUNT_SUFFIX}`}
                  className={styles.rowItem}
                  data-testid={testIds.createStreamReceiverInput}
                />

                <Field
                  isRequired
                  name="token"
                  label="Token"
                  activeTokenAccountId={values.token}
                  onTokenChoose={async (tokenAccountId: string) => {
                    await setFieldValue('token', tokenAccountId, false);
                    await setFieldTouched('token', true, false);
                    validateField('token');
                  }}
                  component={TokenSelector}
                  className={styles.rowItem}
                />
              </Row>

              <Row className={styles.amount}>
                <Field
                  isRequired
                  name="deposit"
                  label="Amount to stream:"
                  component={FormikInput}
                  placeholder='Amount to stream'
                  className={styles.rowItem}
                  description={(<Balance tokenAccountId={activeTokenAccountId} mode={DisplayMode.CRYPTO} />)}
                  data-testid={testIds.createStreamAmountInput}
                />

                <Field
                  name="cliffDateTime"
                  label="Cliff period"
                  component={CliffPeriodPicker}
                  onCliffDateTimeChange={async (cliffDateTime: Date | null) => {
                    await setFieldValue('cliffDateTime', cliffDateTime, false);
                    await setFieldTouched('cliffDateTime', true, false);
                    validateField('cliffDateTime');
                  }}
                  className={styles.rowItem}
                />
              </Row>

              <Row>
                <Field
                  tokenAccountId={activeTokenAccountId}
                  isRequired
                  name="speed"
                  label="Stream duration:"
                  deposit={values.deposit}
                  component={StreamSpeedCalcField}
                  onSpeedChange={async (speed: number) => {
                    await setFieldValue('speed', speed, false);
                    await setFieldTouched('speed', true, false);
                    validateField('speed');
                  }}
                  className={styles.rowItem}
                />
              </Row>

              <Row>
                <Field
                  maxLength={COMMENT_TEXT_LIMIT}
                  name="comment"
                  label="Comment:"
                  placeholder="Enter comment"
                  component={FormikTextArea}
                  className={styles.rowItem}
                  data-testid={testIds.createStreamCommentInput}
                />
              </Row>

              <Row className={styles.checkboxes}>
                <Field
                  name="delayed"
                  disabled={Boolean(values.cliffDateTime)}
                  description={DELAYED_DESCRIPTION}
                  type="checkbox"
                  component={FormikCheckbox}
                  data-testid={testIds.createStreamDelayedCheckbox}
                />

                <Field
                  name="isLocked"
                  description={LOCK_DESCRIPTION}
                  type="checkbox"
                  component={FormikCheckbox}
                  data-testid={testIds.createStreamLockedCheckbox}
                />
              </Row>

              <Row>
                {tokenMeta && (
                  <div className={styles.feeDisclaimer}>
                    {`You will be charged 
                      ${formatter.amount(roketoMeta.commission_on_create)} 
                      ${tokenMeta.symbol} fee for the stream`}
                  </div>
                )}
              </Row>

              <div className={styles.actionButtonsWrapper}>
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
