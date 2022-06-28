import classNames from 'classnames';
import {useStore} from 'effector-react';
import {Field, Formik} from 'formik';
import React, {useState} from 'react';

import {$tokens} from '~/entities/wallet';

import {formatAmount} from '~/shared/api/ft/token-formatter';
import {FormikCheckbox} from '~/shared/components/FormikCheckbox';
import {FormikDateTimePicker} from '~/shared/components/FormikDateTimePicker';
import {FormikTextArea} from '~/shared/components/FormikTextArea';
import {env} from '~/shared/config';
import {testIds} from '~/shared/constants';
import {useMobile} from '~/shared/hooks/useMobile';

import {Button, DisplayMode as ButtonDisplayMode, ButtonType} from '@ui/components/Button';
import {ErrorSign} from '@ui/icons/ErrorSign';

import {ColorPicker} from '../ColorPicker';
import {
  MASS_STREAMING_INITIAL_FORM_VALUES,
  MassStreamingFormValues,
  StreamColor,
} from '../constants';
import {TokenSelector} from '../TokenSelector';
import {massStreamingFormValidationSchema} from './model';
import styles from './styles.module.scss';

const PLACEHOLDER_RECEIVERS_AND_AMOUNTS = `account1.${env.ACCOUNT_SUFFIX},11
account2.${env.ACCOUNT_SUFFIX},12.457
account3.${env.ACCOUNT_SUFFIX},1.3`;

type CreateStreamProps = {
  onFormSubmit: (values: MassStreamingFormValues) => Promise<void>;
  onFormCancel: () => void;
};

export const CreateMassStreaming = ({onFormCancel, onFormSubmit}: CreateStreamProps) => {
  const tokens = useStore($tokens);
  const [submitError, setError] = useState<Error | null>(null);

  const handleFormSubmit = (formValues: MassStreamingFormValues) => {
    onFormSubmit(formValues).catch((error) => {
      console.error(error);
      setError(error);
    });
  };

  const isMobile = useMobile();

  return (
    <Formik
      initialValues={MASS_STREAMING_INITIAL_FORM_VALUES}
      onSubmit={handleFormSubmit}
      validateOnBlur
      validationSchema={massStreamingFormValidationSchema}
      validateOnChange={false}
      validateOnMount={false}
    >
      {({values, handleSubmit, setFieldValue, setFieldTouched, validateField}) => {
        const activeTokenAccountId = values.token;
        const token = tokens[activeTokenAccountId];
        if (!token) return null;
        const {meta: tokenMeta, roketoMeta} = token;

        const onChoose = async (fieldName: string, value: any) => {
          await setFieldValue(fieldName, value, false);
          await setFieldTouched(fieldName, true, false);
          validateField(fieldName);
        };

        return (
          <form onSubmit={handleSubmit}>
            <div
              className={classNames(
                styles.horizontalRow,
                styles.withAllFlexy,
                isMobile && styles.verticalRow,
              )}
            >
              <Field
                isRequired
                name="token"
                label="Token"
                activeTokenAccountId={values.token}
                onTokenChoose={(tokenAccountId: string) => onChoose('token', tokenAccountId)}
                component={TokenSelector}
                withNameOnly
              />

              <Field
                isRequired
                name="streamEndDateTime"
                label="Stream end date"
                component={FormikDateTimePicker}
                onChange={async (dateTime: Date | null) => {
                  await onChoose('streamEndDateTime', dateTime);
                  validateField('cliffDateTime');
                }}
                withSmallFont
              />

              <Field
                name="cliffDateTime"
                label="Cliff period"
                component={FormikDateTimePicker}
                onChange={(dateTime: Date | null) => onChoose('cliffDateTime', dateTime)}
                withSmallFont
              />
            </div>

            <div className={classNames(styles.horizontalRow, isMobile && styles.spaceBetween)}>
              <Field
                name="color"
                label="Add tag"
                component={ColorPicker}
                className={styles.color}
                onChoose={(color: StreamColor) => onChoose('color', color)}
              />

              <Field
                name="isLocked"
                description="Uneditable stream"
                type="checkbox"
                component={FormikCheckbox}
                data-testid={testIds.createStreamLockedCheckbox}
              />
            </div>

            <Field
              name="receiversAndAmounts"
              label="Address list"
              isRequired
              placeholder={PLACEHOLDER_RECEIVERS_AND_AMOUNTS}
              component={FormikTextArea}
              spellCheck={false}
            />

            {tokenMeta && (
              <div className={styles.feeDisclaimer}>
                {`You will be charged
                  ${formatAmount(tokenMeta.decimals, roketoMeta.commission_on_create)}
                  ${tokenMeta.symbol} fee for each stream`}
              </div>
            )}
            <div className={styles.limitationsDisclaimer}>
              <div>
                Currently there are technical limitations on how many streams can be created at
                once.
              </div>
              <div>
                If "Create" button does nothing or you see "414 Request-URI Too Large" error after
                redirect, please try creating less streams at once.
              </div>
            </div>
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
  );
};
