import React, { useState } from 'react';
import { Formik, Field, FieldProps, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import type { Near } from 'near-api-js';

import { FormField } from 'shared/kit/FormField';
import { Input } from 'shared/kit/Input';
import { Button } from 'shared/kit/Button';
import { TokenImage } from 'shared/kit/TokenImage';
import { DropdownMenu, DropdownMenuItem } from 'shared/kit/DropdownMenu';
import { DropdownOpener } from 'shared/kit/DropdownOpener';
import { RadioButton } from 'shared/kit/RadioButton';
import { Tooltip } from 'shared/kit/Tooltip';
import { TokenFormatter } from 'shared/helpers/formatting';
import { env } from 'shared/config';
import { useRoketoContext } from 'app/roketo-context';
import { StreamSpeedCalcField } from './StreamSpeedCalcField';

type StreamFormSchemaParams = {
  near: Near;
  accountId: string;
};

const CreateStreamFormSchema = ({ near, accountId }: StreamFormSchemaParams) => Yup.object().shape({
  receiver: Yup.string()
    .required('Receiver is a required')
    .test(
      'receiver-not-equal-owner',
      'Receiver can not be the same as owner',
      (value) => value !== accountId,
    )
    .test(
      'receiver-is-valida-address',
      'Address does not exists',
      async (value) => {
        try {
          return Boolean(value && await near.connection.provider.query({
            request_type: 'view_account',
            finality: 'final',
            account_id: value,
          }));
        } catch (error) {
          return false;
        }
      },
    ),
  token: Yup.string().required(),
  deposit: Yup.number()
    .required()
    .moreThan(0, 'Deposit should be more than 0'),
  speed: Yup.number().required().moreThan(0, 'Choose stream duration'),
  autoDeposit: Yup.boolean(),
  autoStart: Yup.boolean(),
  comment: Yup.string().max(255),
});

export type CreateStreamFormValues = {
  receiver: string;
  autoDeposit: boolean;
  autoStart: boolean;
  comment: string;
  deposit: number;
  speed: number;
  token: string;
};

type CreateStreamFormProps = {
  onSubmit: (values: CreateStreamFormValues) => void;
};

export function CreateStreamForm({ onSubmit }: CreateStreamFormProps) {
  const { near, auth, tokens, roketo } = useRoketoContext();

  const schema = CreateStreamFormSchema({
    accountId: auth.accountId,
    near,
  });

  const [dropdownOpened, setDropdownOpened] = useState(false);

  const [submitError, setError] = useState<Error | null>(null);

  const tokensNames = tokens.tickers;
  const formikOnSubmit = async (values: CreateStreamFormValues, formikHelpers: FormikHelpers<CreateStreamFormValues>) => {
    console.debug('Formik submit', values, formikHelpers);
    try {
      const res = await onSubmit(values);
      return res;
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error);
      }
    }
  };
  return (
    <Formik<CreateStreamFormValues>
      initialValues={{
        receiver: '',
        token: 'NEAR',
        speed: 0,
        deposit: 0,
        autoDeposit: false,
        autoStart: true,
        comment: '',
      }}
      validationSchema={schema}
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
        const tokenMeta = roketo.tokenMeta(values.token);
        const formatter = TokenFormatter(
          tokens.get(values.token).metadata.decimals,
        );
        return (
          <form className="max-w-lg mx-auto w-full" onSubmit={handleSubmit}>
            <Field name="receiver">
              {({
                field,
                meta,
              }: FieldProps<CreateStreamFormValues['receiver']>) => (
                <FormField
                  label="Receiver:"
                  className="mb-4"
                  error={meta.error}
                >
                  <Input>
                    <input
                      placeholder={`receiver.${env.ACCOUNT_SUFFIX}`}
                      id="ownerInput"
                      {...field}
                    />
                  </Input>
                </FormField>
              )}
            </Field>

            <div className="flex mb-4">
              <Field name="token">
                {({
                  field,
                  meta,
                }: FieldProps<CreateStreamFormValues['token']>) => (
                  <FormField
                    label="Token:"
                    className="w-1/3 items-center relative"
                    error={meta.error}
                  >
                    <DropdownOpener
                      minimal
                      className="bg-input text-white focus-within:border-blue hover:border-blue text-xl h-14 px-4 py-3 border border-border w-36"
                      onChange={setDropdownOpened}
                    >
                      <div className="inline-flex items-center">
                        <TokenImage
                          tokenName={field.value}
                          className="mr-1"
                        />
                        {' '}
                        <span>{field.value}</span>
                      </div>
                    </DropdownOpener>

                    <DropdownMenu
                      opened={dropdownOpened}
                      className="z-10"
                      onClose={() => setDropdownOpened(false)}
                    >
                      {tokensNames.map((option: string) => (
                        <DropdownMenuItem
                          className="focus-within:border-blue"
                          key={option}
                        >
                          <RadioButton
                            label={(
                              <div className="inline-flex items-center">
                                <TokenImage
                                  size={6}
                                  tokenName={option}
                                  className="mr-1"
                                />
                                {' '}
                                <span>{option}</span>
                              </div>
                            )}
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
                  field,
                  meta,
                }: FieldProps<CreateStreamFormValues['deposit']>) => (
                  <FormField
                    label={(
                      <span>
                        <span>Stream initial deposit:</span>
                        <Tooltip
                          className="ml-2"
                          overlay="Funds which will be used to create an initial stream for a set period. This deposit can be extended in manual or automatic mode."
                        />
                      </span>
                    )}
                    className="w-2/3"
                    error={meta.error}
                  >
                    <Input>
                      <input placeholder="0.00" {...field} />
                    </Input>
                  </FormField>
                )}
              </Field>
            </div>

            <div className="block mb-4">
              <Field name="speed">
                {({
                  field,
                  meta,
                }: FieldProps<CreateStreamFormValues['speed']>) => (
                  <FormField
                    label={(
                      <div className="relative">
                        <div>
                          Period to unlock the initial deposit:
                          {' '}
                          <Tooltip
                            className="ml-2"
                            overlay="In case of no extensions for an initial deposit after this period will be reached receiver will be able to withdraw whole initial deposit and close the stream. "
                          />
                        </div>
                        <div className="text-xs text-gray absolute right-0 top-1">
                          Streaming speed:
                          {' '}
                          {formatter.tokensPerS(field.value)}
                          {' '}
                          {values.token}
                          {' '}
                          / sec
                        </div>
                      </div>
                    )}
                    error={meta.error}
                  >
                    {' '}
                    <StreamSpeedCalcField
                      token={values.token}
                      deposit={Number(formatter.toInt(values.deposit))}
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
                field,
                meta,
              }: FieldProps<CreateStreamFormValues['comment']>) => (
                <FormField
                  className="mb-6"
                  error={meta.error}
                  label={(
                    <div className="flex justify-between items-center">
                      <div className="mb-1">Comment:</div>
                      <div className="text-xs text-gray">
                        {(field.value && field.value.length) || 0}
                        /255
                      </div>
                    </div>
                  )}
                >
                  <label className="h-40 Input font-semibold flex p-4 pt-0 rounded-lg border  bg-input text-white focus-within:border-blue hover:border-blue border-border">
                    <textarea
                      id="commentInput"
                      className=" bg-input  w-full h-full pt-2 focus:outline-none resize-none"
                      placeholder="Enter comment"
                      maxLength={255}
                      {...field}
                    />
                  </label>
                </FormField>
              )}
            </Field>

            {submitError && (
              <p className="text-special-inactive my-4">
                Submit error:
                {' '}
                {submitError.message}
              </p>
            )}
            <div className="flex relaitive">
              <div>
                <label className="flex">
                  <Field name="autoDeposit" className="mr-1" type="checkbox" />
                  <span>
                    Enable auto deposit?
                    {' '}
                    <Tooltip
                      className="ml-2"
                      overlay="Check this if you want make this stream infinite extending getting deposits from income streams with saving initial stream speed."
                    />
                  </span>
                </label>
                <label className="flex">
                  <Field name="autoStart" className="mr-1" type="checkbox" />
                  <span>
                    Start stream immediately?
                    {' '}
                    <Tooltip
                      className="ml-2"
                      overlay="Check this if you want this stream to start transferring funds immediately."
                    />
                  </span>
                </label>

                <p className="text-left text-gray w-2/3 text-sm">
                  You will be charged
                  {' '}
                  {tokenMeta && formatter.amount(tokenMeta.commission_on_create)}
                  {' '}
                  {tokenMeta?.ticker}
                  {' '}
                  fee for that stream
                </p>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                variant="main"
                size="big"
                className="rounded-lg"
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