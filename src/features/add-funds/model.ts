import {addFunds} from '@roketo/sdk';

import {$roketoWallet} from '~/entities/wallet';

import {toYocto} from '~/shared/api/token-formatter';
import {env} from '~/shared/config';
import {createProtectedEffect} from '~/shared/lib/protectedEffect';

export const addFundsFx = createProtectedEffect({
  source: $roketoWallet,
  async fn(
    {tokens, transactionMediator},
    {
      streamId,
      hasValidAdditionalFunds,
      tokenAccountId,
      deposit,
    }: {
      streamId: string;
      hasValidAdditionalFunds: boolean;
      tokenAccountId: string;
      deposit: string;
    },
  ) {
    if (!hasValidAdditionalFunds) return null;
    const token = tokens[tokenAccountId];
    const amount = toYocto(token.meta.decimals, deposit);
    return addFunds({
      amount,
      streamId,
      callbackUrl: window.location.href,
      tokenAccountId,
      transactionMediator,
      roketoContractName: env.ROKETO_CONTRACT_NAME,
      wNearId: env.WNEAR_ID,
    });
  },
});
