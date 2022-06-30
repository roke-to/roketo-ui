import {$roketoWallet} from '~/entities/wallet';

import {addFunds} from '~/shared/api/methods';
import {toYocto} from '~/shared/api/token-formatter';
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
    });
  },
});
