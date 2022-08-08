import type BigNumber from 'bignumber.js';
import {createEvent, createStore, sample} from 'effector';

import {$accountStreams, $roketoWallet, $tokens} from '~/entities/wallet';

import {withdrawStreams} from '~/shared/api/methods';
import {getAvailableToWithdraw, hasPassedCliff, isActiveStream} from '~/shared/api/roketo/lib';
import {formatAmount} from '~/shared/api/token-formatter';
import {createProtectedEffect} from '~/shared/lib/protectedEffect';

export const triggerWithdrawAll = createEvent();

export const withdrawAllFx = createProtectedEffect({
  source: $roketoWallet,
  fn({transactionMediator}, streamIds: string[]) {
    return withdrawStreams({streamIds, transactionMediator});
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
    streams: $accountStreams.map((streams) => streams.inputs),
  },
  target: $activeTokensInfo,
  fn({tokens, streams: inputs}) {
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
      if (!hasPassedCliff(stream)) {
        // eslint-disable-next-line no-continue
        continue;
      }
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
        tokensData[tokenAccountId].available = tokensData[tokenAccountId].available.plus(available);
      }
    }
    return {
      tokenData: Object.values(tokensData)
        .filter((value) => tokens[value.tokenAccountId])
        .map((value) => {
          const {meta} = tokens[value.tokenAccountId];
          return {
            tokenAccountId: value.tokenAccountId,
            amount: formatAmount(meta.decimals, value.available.toFixed()),
            symbol: meta.symbol,
          };
        }),
      streamIds,
    };
  },
});
