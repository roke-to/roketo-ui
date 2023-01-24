import * as Yup from 'yup';

import {COMMENT_TEXT_LIMIT} from '../constants';

export const formValidationSchema = Yup.object().shape({
  nftContractId: Yup.string().required('NFT Contract is required'),
  nftId: Yup.number().required(),
  streamName: Yup.string().max(100, 'Stream name must be less or equal 100 symbols'),
  token: Yup.string().required(),
  deposit: Yup.number()
    .required('Deposit is required')
    .moreThan(0, 'Deposit should be more than 0'),
  duration: Yup.number()
    .required('Stream duration is required')
    .moreThan(0, 'Choose stream duration')
    .max(94694400, 'Max duration: 36 month'),
  autoStart: Yup.boolean(),
  comment: Yup.string().max(COMMENT_TEXT_LIMIT),
  isLocked: Yup.boolean(),
  color: Yup.string(),
  cliffDateTime: Yup.date()
    .nullable()
    .test('futureDate', 'Date cannot be in the past', (value) => !value || value > new Date())
    .test(
      'overCliff',
      'Cliff period cannot be longer than stream duration',
      (value, {parent}) => !value || value.getTime() < Date.now() + parent.duration * 1000,
    ),
});
