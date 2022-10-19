import {getAvailableToWithdraw, getStreamProgress} from '@roketo/sdk';
import type {RichToken, RoketoStream} from '@roketo/sdk/dist/types';
import {BigNumber} from 'bignumber.js';

import type {PriceOracle} from '~/shared/api/price-oracle';
import {toHumanReadableValue} from '~/shared/api/token-formatter';

const INITIAL_VALUE = new BigNumber(0);
const MANTISSA = 3;

export const countTotalUSDWithdrawal = (
  streams: RoketoStream[],
  tokens: Record<string, RichToken>,
  priceOracle: PriceOracle,
) => {
  const availableForWithdrawal = streams
    .filter((stream) => tokens[stream.token_account_id])
    .reduce((withdrawalSum, inputStream) => {
      const tokenAccountId = inputStream.token_account_id;
      const {meta} = tokens[tokenAccountId];

      const withdrawal = getAvailableToWithdraw(inputStream).toFixed();
      const amountForDisplay = toHumanReadableValue(meta.decimals, withdrawal, MANTISSA);

      const amountInUSD = priceOracle.getPriceInUsd(tokenAccountId, amountForDisplay);

      return withdrawalSum.plus(amountInUSD);
    }, INITIAL_VALUE);

  return Number(availableForWithdrawal.toFixed(0));
};

export const collectTotalFinancialAmountInfo = (
  streams: RoketoStream[],
  tokens: Record<string, RichToken>,
  priceOracle: PriceOracle,
) => {
  const initialInfo = {total: INITIAL_VALUE, streamed: INITIAL_VALUE, withdrawn: INITIAL_VALUE};

  const totalFinancialInfo = streams
    .filter((stream) => tokens[stream.token_account_id])
    .reduce((financialInfoAccumulator, stream) => {
      const tokenAccountId = stream.token_account_id;
      const {meta} = tokens[tokenAccountId];

      const progress = getStreamProgress({stream});

      const streamedAmountForDisplay = toHumanReadableValue(
        meta.decimals,
        progress.streamed,
        MANTISSA,
      );
      const streamedUSD = priceOracle.getPriceInUsd(tokenAccountId, streamedAmountForDisplay);

      const fullAmountForDisplay = toHumanReadableValue(meta.decimals, progress.full, MANTISSA);
      const fullUSD = priceOracle.getPriceInUsd(tokenAccountId, fullAmountForDisplay);

      const withdrawnAmountForDisplay = toHumanReadableValue(
        meta.decimals,
        progress.withdrawn,
        MANTISSA,
      );
      const withdrawnUSD = priceOracle.getPriceInUsd(tokenAccountId, withdrawnAmountForDisplay);

      return {
        total: financialInfoAccumulator.total.plus(fullUSD),
        streamed: financialInfoAccumulator.streamed.plus(streamedUSD),
        withdrawn: financialInfoAccumulator.withdrawn.plus(withdrawnUSD),
      };
    }, initialInfo);

  return {
    total: Number(totalFinancialInfo.total.toFixed(0)),
    streamed: Number(totalFinancialInfo.streamed.toFixed(0)),
    withdrawn: Number(totalFinancialInfo.withdrawn.toFixed(0)),
  };
};
