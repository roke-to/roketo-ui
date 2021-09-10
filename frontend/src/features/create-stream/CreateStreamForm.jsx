import React, {useState} from 'react';
import {Formik, Field} from 'formik';
import * as Yup from 'yup';

import {FormField, Input, Button} from '../../components/kit';
import {useNear} from '../near-connect/useNear';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownOpener,
  RadioButton,
} from '../../components/kit';
import {Tokens} from '../../components/icons';
import {tokens, TokenFormatter} from '../../lib/formatting';
import {StreamSpeedCalcField} from './StreamSpeedCalcField';

const CreateStreamFormSchema = Yup.object().shape({
  owner: Yup.string().required('Owner is a required'),
  receiver: Yup.string().required('Receiver is a required'),
  token: Yup.string().required(),
  deposit: Yup.number().required().moreThan(0, 'Deposit should be more than 0'),
  speed: Yup.number().required().moreThan(0, 'Choose stream duration'),
  autoDeposit: Yup.boolean(),
  comment: Yup.string().max(255),
});

export function CreateStreamForm({account, onSubmit}) {
  const near = useNear();
  const profileId = near.auth.signedAccountId;

  const [dropdownOpened, setDropdownOpened] = useState(false);

  const [submitError, setError] = useState(null);

  const tokensNames = Object.keys(tokens).filter((item) => item !== 'fallback');

  const formikOnSubmit = async (...args) => {
    try {
      let res = await onSubmit(...args);
      return res;
    } catch (error) {
      setError(error);
    }
  };
  return (
    <Formik
      initialValues={{
        owner: profileId,
        receiver: '',
        token: 'NEAR',
        speed: 0,
        deposit: 0,
        autoDeposit: false,
        comment: '',
      }}
      validationSchema={CreateStreamFormSchema}
      onSubmit={formikOnSubmit}
      validateOnBlur={false}
      validateOnChange={false}
      validateOnMount={false}
    >
      {({
        values,
        setFieldValue,
        setFieldTouched,
        handleSubmit,
        isSubmitting,
      }) => {
        const formatter = TokenFormatter(values.token);
        return (
          <form
            className="twind-max-w-lg twind-mx-auto twind-w-full"
            onSubmit={handleSubmit}
          >
            <Field name="owner">
              {({
                field, // { name, value, onChange, onBlur }
                form: {touched, errors}, // also values, setXXXX, handleXXXX, dirty, isValid, status, etc.
                meta,
              }) => (
                <FormField
                  label="Owner:"
                  className="twind-mb-4"
                  error={meta.error}
                >
                  <Input>
                    <input
                      placeholder="owner.near"
                      id="ownerInput"
                      {...field}
                    />
                  </Input>
                </FormField>
              )}
            </Field>

            <Field name="receiver">
              {({
                field, // { name, value, onChange, onBlur }
                form: {touched, errors}, // also values, setXXXX, handleXXXX, dirty, isValid, status, etc.
                meta,
              }) => (
                <FormField
                  label="Receiver:"
                  className="twind-mb-4"
                  error={meta.error}
                >
                  <Input>
                    <input
                      placeholder="owner.near"
                      id="ownerInput"
                      {...field}
                    />
                  </Input>
                </FormField>
              )}
            </Field>

            <div className="twind-flex twind-mb-4">
              <Field name="token">
                {({
                  field, // { name, value, onChange, onBlur }
                  form: {touched, errors}, // also values, setXXXX, handleXXXX, dirty, isValid, status, etc.
                  meta,
                }) => (
                  <FormField
                    label="Token:"
                    className="twind-w-1/3 twind-items-center twind-relative"
                    error={meta.error}
                  >
                    <DropdownOpener
                      minimal
                      className="twind-bg-input twind-text-white focus-within:twind-border-blue hover:twind-border-blue twind-text-xl twind-h-14 twind-px-4 twind-py-3 twind-border twind-border-border twind-w-36"
                      onClick={() => {
                        setDropdownOpened(!dropdownOpened);
                      }}
                    >
                      <div className="twind-inline-flex">
                        {<Tokens tokenName={field.value} />}{' '}
                        <span>{field.value}</span>
                      </div>
                    </DropdownOpener>

                    <DropdownMenu
                      opened={dropdownOpened}
                      className="twind-z-10"
                    >
                      {tokensNames.map((option) => (
                        <DropdownMenuItem
                          className="focus-within:twind-border-blue"
                          key={option}
                        >
                          <RadioButton
                            label={
                              <div className="twind-inline-flex">
                                {<Tokens tokenName={option} />}{' '}
                                <span>{option}</span>
                              </div>
                            }
                            active={field.value === option}
                            value={option}
                            onChange={(value) => {
                              setDropdownOpened(false);
                              setFieldValue(field.name, value, false);
                              setFieldTouched(field.name, true, false);
                            }}
                          />
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenu>
                  </FormField>
                )}
              </Field>

              <Field name="deposit">
                {({
                  field, // { name, value, onChange, onBlur }
                  form: {touched, errors}, // also values, setXXXX, handleXXXX, dirty, isValid, status, etc.
                  meta,
                }) => (
                  <FormField
                    label="Amount to stream:"
                    className="twind-w-2/3"
                    error={meta.error}
                  >
                    <Input>
                      <input placeholder="0.00" {...field} />
                    </Input>
                  </FormField>
                )}
              </Field>
            </div>

            <div className="twind-block twind-mb-4">
              <Field name="speed">
                {({
                  field, // { name, value, onChange, onBlur }
                  form: {touched, errors}, // also values, setXXXX, handleXXXX, dirty, isValid, status, etc.
                  meta,
                }) => (
                  <FormField
                    label={
                      <div className="twind-relative">
                        <div>Stream duration:</div>
                        <div className="twind-text-xs twind-text-gray twind-absolute twind-right-0 twind-top-1">
                          Streaming speed: {formatter.tokensPerS(field.value)}{' '}
                          {values.token} / sec
                        </div>
                      </div>
                    }
                    error={meta.error}
                  >
                    {' '}
                    <StreamSpeedCalcField
                      token={values.token}
                      deposit={formatter.toInt(values.deposit)}
                      onChange={(speed) => {
                        setFieldValue(field.name, speed, false);
                        setFieldTouched(field.name, true, false);
                      }}
                    />
                  </FormField>
                )}
              </Field>
            </div>

            <Field name="comment">
              {({
                field, // { name, value, onChange, onBlur }
                form: {touched, errors}, // also values, setXXXX, handleXXXX, dirty, isValid, status, etc.
                meta,
              }) => (
                <FormField
                  className="twind-mb-6"
                  error={meta.error}
                  label={
                    <div className="twind-flex twind-justify-between twind-items-center">
                      <div className="twind-mb-1">Comment:</div>
                      <div className="twind-text-xs twind-text-gray">
                        {(field.value && field.value.length) || 0}/255
                      </div>
                    </div>
                  }
                >
                  <label className="twind-h-40 Input twind-font-semibold twind-flex twind-p-4 twind-pt-0 twind-rounded-lg twind-border  twind-bg-input twind-text-white focus-within:twind-border-blue hover:twind-border-blue twind-border-border">
                    <textarea
                      id="commentInput"
                      className=" twind-bg-input  twind-w-full twind-h-full twind-pt-2 focus:twind-outline-none twind-resize-none"
                      placeholder="Enter comment"
                      maxLength="255"
                      {...field}
                    />
                  </label>
                </FormField>
              )}
            </Field>

            {submitError && (
              <p className="twind-text-special-inactive twind-my-4">
                Submit error: {submitError.message}
              </p>
            )}
            <div className="twind-flex twind-relaitive">
              <div>
                <label className="twind-flex">
                  <Field
                    name="autoDeposit"
                    className="twind-mr-1"
                    type="checkbox"
                  />
                  <span>Enable auto deposit?</span>
                </label>

                <p className="twind-text-left twind-text-gray twind-w-2/3 twind-text-sm">
                  You will be charged 0.1 NEAR fee for that stream
                </p>
              </div>

              <Button
                disabled={isSubmitting}
                variant="main"
                size="big"
                className="twind-rounded-lg"
              >
                Create Stream
              </Button>
            </div>
          </form>
        );
      }}
    </Formik>
  );
}
