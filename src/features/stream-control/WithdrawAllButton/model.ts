import {createStore, createEvent, sample, attach} from 'effector';
import type BigNumber from 'bignumber.js';

import {$roketoWallet, $tokens, $accountStreams} from '~/entities/wallet';
import {
  getAvailableToWithdraw,
  isActiveStream,
} from '~/shared/api/roketo/helpers';

export const triggerWithdrawAll = createEvent();

const withdrawAllFx = attach({
  source: $roketoWallet,
  async effect(wallet, streamIds: string[]) {
    await wallet?.roketo.api.withdraw({streamIds});
  },
});

const $activeTokensInfo = createStore<{
  tokenData: Array<{
    tokenAccountId: string;
    amount: string;
    symbol: string;
  }>;
  streamIds: string[];
}>({tokenData: [], streamIds: []});

export const $tokenData = $activeTokensInfo.map(({tokenData}) => tokenData);

/**
 * when triggerWithdrawAll is called
 * read streamIds from $activeTokensInfo
 * and if streamIds is not empty
 * then trigger withdrawAllFx with it
 */
sample({
  clock: triggerWithdrawAll,
  source: $activeTokensInfo.map(({streamIds}) => streamIds),
  filter: (streamIds) => streamIds.length > 0,
  target: withdrawAllFx,
});

sample({
  source: {
    tokens: $tokens,
    streams: $accountStreams,
  },
  target: $activeTokensInfo,
  fn({tokens, streams: {inputs}}) {
    const activeInputs = inputs.filter(isActiveStream);
    const tokensData: {
      [tokenAccountId: string]: {
        available: BigNumber;
        tokenAccountId: string;
      };
    } = {};
    const streamIds: string[] = [];

    // eslint-disable-next-line no-restricted-syntax
    for (const stream of activeInputs) {
      const tokenAccountId = stream.token_account_id;
      const available = getAvailableToWithdraw(stream);

      if (available.toFixed() !== '0') {
        streamIds.push(stream.id);
      }

      if (!tokensData[tokenAccountId]) {
        tokensData[tokenAccountId] = {
          available,
          tokenAccountId,
        };
      } else {
        tokensData[tokenAccountId].available =
          tokensData[tokenAccountId].available.plus(available);
      }
    }
    return {
      tokenData: Object.values(tokensData).map((value) => {
        const token = tokens[value.tokenAccountId];
        return {
          tokenAccountId: value.tokenAccountId,
          amount: token.formatter.amount(value.available.toFixed()),
          symbol: token.meta.symbol,
        };
      }),
      streamIds,
    };
  },
});
