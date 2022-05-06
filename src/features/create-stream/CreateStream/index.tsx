import React, {useState} from 'react';
import cn from 'classnames';
import {Field, Formik} from 'formik';

import {useRoketoContext} from 'app/roketo-context';

import {Button, ButtonType, DisplayMode as ButtonDisplayMode} from '@ui/components/Button';
import {ErrorSign} from '@ui/icons/ErrorSign';

import {FormikInput} from 'shared/components/FormikInput';
import {FormikTextArea} from 'shared/components/FormikTextArea';
import {FormikCheckbox} from 'shared/components/FormikCheckbox';
import {Balance, DisplayMode} from 'shared/components/Balance';
import { testIds } from 'shared/constants';

import {env} from 'shared/config';

import {StreamSpeedCalcField} from '../StreamSpeedCalcField';
import {TokenSelector} from '../TokenSelector';
import {FeeDisclaimer} from '../FeeDisclaimer'

import {INITIAL_FORM_VALUES} from '../constants';

import {getFormValidationSchema} from '../lib';

import styles from './styles.module.scss';

const Row = ({
  children,
  className,
}: {children: React.ReactNode, className?: string}) => (
  <div className={cn(styles.row, className)}>{children}</div>
);

const StreamCreationError = ({error}: {error: string}) => (
  <div className={styles.submitError}>
    <ErrorSign />
    <span>{error}</span>
  </div>
);

export type FormValues = {
  receiver: string;
  streamName: string;
  autoStart: boolean;
  comment: string;
  deposit: number;
  speed: number;
  token: string;
}

type CreateStreamProps = {
  onFormSubmit: (values: FormValues) => Promise<void>;
  onFormCancel: () => void;
}

export const CreateStream = ({onFormCancel, onFormSubmit}: CreateStreamProps) => {
  const {near, auth} = useRoketoContext();

  const [submitError, setError] = useState<Error | null>(null);

  const validationSchema = getFormValidationSchema(near, auth.accountId);

  const handleFormSubmit = (formValues: FormValues) => {
    onFormSubmit(formValues)
      .catch(error => setError(error));
  }

  return (
    <div className={styles.root}>
      <h2 className={styles.title}>Create Stream</h2>
      <p className={styles.description}>Stream your tokens to the receiver directly</p>

      <Formik
        initialValues={INITIAL_FORM_VALUES}
        onSubmit={handleFormSubmit}

        validationSchema={validationSchema}
        validateOnBlur={false}
        validateOnChange={false}
        validateOnMount={false}
      >
        {({
          values,
          handleSubmit,
          setFieldValue,
          setFieldTouched,
        }) => {
          const activeTokenAccountId = values.token;

          return (
            <form onSubmit={handleSubmit} className={styles.form}>

              <Row>
                <Field
                  name="streamName"
                  label="Stream name:"
                  component={FormikInput}
                  placeholder='Stream name'
                  className={styles.rowItem}
                />

                <Field
                  isRequired
                  name="receiver"
                  label="Receiver:"
                  component={FormikInput}
                  placeholder={`receiver.${env.ACCOUNT_SUFFIX}`}
                  className={styles.rowItem}
                  data-testid={testIds.createStreamReceiverInput}
                />
              </Row>

              <Row>
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
                  isRequired
                  name="token"
                  label="Token"
                  activeTokenAccountId={values.token}
                  onTokenChoose={(tokenAccountId: string) => {
                    setFieldValue('token', tokenAccountId, false);
                    setFieldTouched('token', true, false);
                  }}
                  component={TokenSelector}
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
                  onSpeedChange={(speed: number) => {
                    setFieldValue('speed', speed, false);
                    setFieldTouched('speed', true, false);
                  }}
                  className={styles.rowItem}
                />
              </Row>

              <Row>
                <Field
                  maxLength={255}
                  name="comment"
                  label="Comment:"
                  placeholder="Enter comment"
                  component={FormikTextArea}
                  className={styles.rowItem}
                  data-testid={testIds.createStreamCommentInput}
                />
              </Row>

              <Row>
                <Field
                  name="autoStart"
                  description="Start stream immediately"
                  type="checkbox"
                  component={FormikCheckbox}
                  className={styles.rowItem}
                  data-testid={testIds.createStreamAutostartCheckbox}
                />
              </Row>

              <Row>
                <FeeDisclaimer tokenAccountId={activeTokenAccountId} className={styles.feeDisclaimer} />
              </Row>

              <div className={styles.actionButtonsWrapper}>
                {submitError &&
                  <StreamCreationError error={submitError.message} />
                }

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
