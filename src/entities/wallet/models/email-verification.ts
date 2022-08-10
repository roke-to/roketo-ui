import {attach} from 'effector';

import {usersApiClient} from '~/shared/api/roketo-client';

import {$accountId} from './account';

export const resendVerificationEmailFx = attach({
  source: $accountId,
  async effect(accountId) {
    if (accountId) {
      return usersApiClient.resendVerificationEmail(accountId);
    }
  },
});
