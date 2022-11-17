import * as Yup from 'yup';
import {attach} from 'effector';

import {$accountId, $nearWallet} from '~/entities/wallet';

import {COMMENT_TEXT_LIMIT} from '../constants';

const isReceiverNotEqualOwnerFx = attach({
  source: $accountId,
  effect: (accountId, value: string | undefined) => !!accountId && value !== accountId,
});

const isAddressNotExistsFx = attach({
  source: $nearWallet,
  async effect(wallet, value: string | undefined) {
    if (!wallet || !value) return false;
    try {
      const result = await wallet.auth.account.connection.provider.query({
        request_type: 'view_account',
        finality: 'final',
        account_id: value,
      });
      return Boolean(result);
    } catch {
      return false;
    }
  },
});

export const formValidationSchema = Yup.object().shape({
  receiver: Yup.string()
    .required('Receiver is required')
    .test(
      'receiver-not-equal-owner',
      'Receiver can not be the same as the owner',
      isReceiverNotEqualOwnerFx,
    )
    .test('receiver-is-valida-address', 'Address does not exists', isAddressNotExistsFx),
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
