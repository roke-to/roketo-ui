import * as Yup from 'yup';
import type {Near} from 'near-api-js';
import BigNumber from 'bignumber.js';
import {addMonths, differenceInDays} from 'date-fns';

import {SECONDS_IN_DAY, SECONDS_IN_HOUR, SECONDS_IN_MINUTE} from 'shared/constants';

import type {RichToken} from 'shared/api/ft';

export const getFormValidationSchema = (near: Near, accountId: string) => Yup.object().shape({
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
  streamName: Yup.string().max(100, 'Stream name must be less or equal 100 symbols'),
  token: Yup.string().required(),
  deposit: Yup.number()
    .required()
    .moreThan(0, 'Deposit should be more than 0'),
  speed: Yup.number().required().moreThan(0, 'Choose stream duration'),
  autoStart: Yup.boolean(),
  comment: Yup.string().max(255),
});

export const getDurationInSeconds = (months: number, days: number, hours: number, minutes: number) => {
  const daysInMonths = differenceInDays(addMonths(new Date(), months), new Date());

  const durationInSeconds = (daysInMonths + days) * SECONDS_IN_DAY
    + minutes * SECONDS_IN_MINUTE
    + hours * SECONDS_IN_HOUR;

  return durationInSeconds;
};

export const getTokensPerSecondCount = (depositInYocto: string, durationInSeconds: number) => {
  const value = new BigNumber(depositInYocto)
    .dividedToIntegerBy(durationInSeconds)
    .toFixed();

  return value !== 'Infinity' && value !== 'NaN' ? value : '0';
};

export const getStreamingSpeed = (speedInSeconds: number, token: RichToken): string => {
  if (speedInSeconds <= 0) {
    return 'none';
  }

  const {formatter, meta} = token;
  const {formattedValue, unit} = formatter.tokensPerMeaningfulPeriod(speedInSeconds);

  return `${formattedValue} ${meta.symbol} / ${unit}`;
};
