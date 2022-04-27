import BigNumber from 'bignumber.js';

import {RichTokens} from 'shared/api/ft';
import {PriceOracle} from 'shared/api/price-oracle';
import {RoketoStream} from 'shared/api/roketo/interfaces/entities';
import {getAvailableToWithdraw} from 'shared/api/roketo/helpers';
import {streamViewData} from 'features/roketo-resource';

const INITIAL_VALUE = new BigNumber(0);

export const countTotalUSDWithdrawal = (
  streams: RoketoStream[],
  tokens: RichTokens,
  priceOracle: PriceOracle
) => {
  const availableForWithdrawal = streams.reduce((withdrawalSum, inputStream) => {
    const tokenAccountId = inputStream.token_account_id;
    const {formatter} = tokens[tokenAccountId];

    const withdrawal = getAvailableToWithdraw(inputStream).toFixed();
    const amountForDisplay = formatter.amount(withdrawal);

    const amountInUSD = priceOracle.getPriceInUsd(tokenAccountId, amountForDisplay);

    return withdrawalSum.plus(amountInUSD);
  }, INITIAL_VALUE);

  return Number(availableForWithdrawal.toFixed(0));
};

export const collectTotalFinancialAmountInfo = (
  streams: RoketoStream[],
  tokens: RichTokens,
  priceOracle: PriceOracle
) => {
  const initialInfo = {total: INITIAL_VALUE, streamed: INITIAL_VALUE, withdrawn: INITIAL_VALUE};

  const totalFinancialInfo = streams.reduce((financialInfoAccumulator, stream) => {
    const tokenAccountId = stream.token_account_id;
    const {formatter} = tokens[tokenAccountId];

    const {progress} = streamViewData(stream);

    const streamedAmountForDisplay = formatter.amount(progress.streamed);
    const streamedUSD = priceOracle.getPriceInUsd(tokenAccountId, streamedAmountForDisplay);

    const fullAmountForDisplay = formatter.amount(progress.full);
    const fullUSD = priceOracle.getPriceInUsd(tokenAccountId, fullAmountForDisplay);

    const withdrawnAmountForDisplay = formatter.amount(progress.withdrawn);
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
