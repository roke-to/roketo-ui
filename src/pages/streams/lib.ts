import {getAvailableToWithdraw, getStreamProgress, parseComment} from '@roketo/sdk';
import type {RichToken, RoketoStream} from '@roketo/sdk/dist/types';
import {BigNumber} from 'bignumber.js';

import type {PriceOracle} from '~/shared/api/price-oracle';
import {toHumanReadableValue} from '~/shared/api/token-formatter';

import type {DirectionFilter, FilterFn, StatusFilter} from './types';

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

export function getDirectionFilter(
  accountId: string | null,
  direction: DirectionFilter,
): FilterFn | null {
  switch (direction) {
    case 'Incoming':
      return (stream) => stream.receiver_id === accountId;
    case 'Outgoing':
      return (stream) => stream.owner_id === accountId;
    default:
      return null;
  }
}

export function getStatusFilter(status: StatusFilter): FilterFn | null {
  switch (status) {
    case 'Initialized':
    case 'Active':
    case 'Paused':
      return (stream) => stream.status === status;
    default:
      return null;
  }
}

export function getTextFilter(accountId: string | null, text: string): FilterFn | null {
  const trimmedText = text.trim();
  if (trimmedText.length > 0) {
    return ({description, owner_id, receiver_id}) => {
      const comment = parseComment(description) ?? '';

      const counterActor = accountId === owner_id ? receiver_id : owner_id;
      return comment.includes(trimmedText) || counterActor.includes(trimmedText);
    };
  }
  return null;
}
