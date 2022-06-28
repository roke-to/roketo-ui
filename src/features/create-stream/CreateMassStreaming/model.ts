import * as Yup from 'yup';

import {isAddressExistsFx, isReceiverNotEqualOwnerFx} from '~/features/create-stream/lib';

export const massStreamingFormValidationSchema = Yup.object().shape({
  receiversAndAmounts: Yup.string()
    .test('empty', 'Cannot be empty', (value) => Boolean(value?.trim()))
    .test('incorrect-format', 'Incorrect format', function (value) {
      const lines = value?.split('\n');

      const linesCorrectness =
        lines?.map((line) => {
          const parts = line.split(',');
          const [, amount] = parts;

          return !line || parts.length === 2 || !Number.isNaN(Number(amount));
        }) ?? [];

      const incorrectLinesIndices = linesCorrectness
        .map((isCorrect, index) => (isCorrect ? null : index + 1))
        .filter((lineNumber) => typeof lineNumber === 'number');

      if (incorrectLinesIndices.length > 0) {
        return this.createError({
          message: `Incorrect format on lines: ${incorrectLinesIndices.join(', ')}`,
        });
      }

      return true;
    })
    .test(
      'receiver-not-equal-owner',
      'Cannot specify yourself as receiver',
      async function (value) {
        const lines = value?.split('\n');

        const linesCorrectness = await Promise.all(
          lines?.map((line) => {
            const [receiver] = line.split(',');

            return !line || isReceiverNotEqualOwnerFx(receiver);
          }) ?? [],
        );

        const incorrectLinesIndices = linesCorrectness
          .map((isCorrect, index) => (isCorrect ? null : index + 1))
          .filter((lineNumber) => typeof lineNumber === 'number');

        if (incorrectLinesIndices.length > 0) {
          return this.createError({
            message: `Cannot specify yourself as receiver, lines: ${incorrectLinesIndices.join(
              ', ',
            )}`,
          });
        }

        return true;
      },
    )
    .test('receivers-are-valid', 'Non-existent receivers', async function (value) {
      const lines = value?.split('\n');

      const receivers =
        lines?.map((line) => {
          const [receiver] = line.split(',');

          return receiver;
        }) ?? [];

      const uniqueReceivers = Array.from(new Set(receivers.filter(Boolean)));

      const uniqueReceiversExistence = await Promise.all(uniqueReceivers.map(isAddressExistsFx));

      const uniqueExistentReceiversSet = new Set(
        uniqueReceiversExistence.map((exists, index) => (exists ? uniqueReceivers[index] : null)),
      );

      const incorrectLinesIndices = receivers
        .map((receiver, index) =>
          !receiver || uniqueExistentReceiversSet.has(receiver) ? null : index + 1,
        )
        .filter((lineNumber) => typeof lineNumber === 'number');

      if (incorrectLinesIndices.length > 0) {
        return this.createError({
          message: `Non-existent receivers are specified on the following lines: ${incorrectLinesIndices.join(
            ', ',
          )}`,
        });
      }

      return true;
    }),
  token: Yup.string().required(),
  isLocked: Yup.boolean(),
  color: Yup.string(),
  streamEndDateTime: Yup.date().test(
    'inThePast',
    'Date cannot be in the past',
    (value) => !value || value > new Date(),
  ),
  cliffDateTime: Yup.date()
    .nullable()
    .test('inThePast', 'Date cannot be in the past', (value) => !value || value > new Date())
    .test(
      'afterStreamEndTime',
      'Cliff date cannot be set after stream end date',
      (value, {parent}) => !value || !parent.streamEndDateTime || value < parent.streamEndDateTime,
    ),
});
