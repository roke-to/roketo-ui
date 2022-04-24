import React from 'react';
import {Field, Formik} from 'formik';

import {useRoketoContext} from 'app/roketo-context';

import {FormikInput} from 'shared/components/FormikInput';
import {FormikTextArea} from 'shared/components/FormikTextArea';
import {Balance, DisplayMode} from 'shared/components/Balance';

import {env} from 'shared/config';

import {StreamSpeedCalcField} from 'features/create-stream/StreamSpeedCalcField';
import {INITIAL_FORM_VALUES} from '../constants';
import {getFormValidationSchema} from '../lib';

import styles from './styles.module.scss';

export type FormValues = {
  receiver: string;
  streamName: string;
  autoStart: boolean;
  comment: string;
  deposit: number;
  speed: number;
  token: string;
}

export const CreateStream = () => {
  const {near, auth} = useRoketoContext();

  const validationSchema = getFormValidationSchema(near, auth.accountId);

  const handleFormSubmit = async (formValues: FormValues) => alert(JSON.stringify(formValues));

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
        }) => {
          const activeTokenAccountId = values.token;
          console.log('activeTokenAccountId ==>', activeTokenAccountId, values);

          return (
            <form onSubmit={handleSubmit} className={styles.form}>

              <div className={styles.row}>
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
                />
              </div>

              <div className={styles.row}>
                <Field
                  isRequired
                  name="deposit"
                  label="Amount to stream:"
                  component={FormikInput}
                  placeholder='Amount to stream'
                  className={styles.rowItem}
                  description={(<Balance tokenAccountId={activeTokenAccountId} mode={DisplayMode.CRYPTO} />)}
                />
              </div>

              <div className={styles.row}>
                <Field
                  tokenAccountId={activeTokenAccountId}
                  isRequired
                  name="speed"
                  label="Stream duration:"
                  component={StreamSpeedCalcField}
                  className={styles.rowItem}
                />
              </div>

              <div className={styles.row}>
                <Field
                  maxLength={255}
                  name="comment"
                  label="Comment:"
                  placeholder="Enter comment"
                  component={FormikTextArea}
                  className={styles.rowItem}
                />
              </div>

            </form>
          );
        }}
      </Formik>
    </div>
  );
};
