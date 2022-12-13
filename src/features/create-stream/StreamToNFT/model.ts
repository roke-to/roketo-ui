import * as Yup from 'yup';
import {attach} from 'effector';

import {$accountId} from '~/entities/wallet';

import {COMMENT_TEXT_LIMIT} from '../constants';

const isReceiverNotEqualOwnerFx = attach({
  source: $accountId,
  effect: (accountId, value: string | undefined) => !!accountId && value !== accountId,
});

export const formValidationSchema = Yup.object().shape({
  nftContractId: Yup.string()
    .required('NFT Contract is required')
    .test(
      'receiver-not-equal-owner',
      'Receiver can not be the same as the owner',
      isReceiverNotEqualOwnerFx,
    ),
  streamName: Yup.string().max(100, 'Stream name must be less or equal 100 symbols'),
  token: Yup.string().required(),
  deposit: Yup.number()
    .required('Deposit is required')
    .moreThan(0, 'Deposit should be more than 0'),
  autoStart: Yup.boolean(),
  comment: Yup.string().max(COMMENT_TEXT_LIMIT),
  isLocked: Yup.boolean(),
  color: Yup.string(),
});
