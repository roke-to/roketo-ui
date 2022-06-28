import BigNumber from 'bignumber.js';
import {addMonths, differenceInDays} from 'date-fns';
import {attach} from 'effector';

import {$accountId, $nearWallet} from '~/entities/wallet';

import type {RichToken} from '~/shared/api/ft';
import {tokensPerMeaningfulPeriod, toYocto} from '~/shared/api/ft/token-formatter';
import {TokenMetadata} from '~/shared/api/ft/types';
import {SECONDS_IN_DAY, SECONDS_IN_HOUR, SECONDS_IN_MINUTE} from '~/shared/constants';

export const getDurationInSeconds = (
  months: number,
  days: number,
  hours: number,
  minutes: number,
) => {
  const daysInMonths = differenceInDays(addMonths(new Date(), months), new Date());

  const durationInSeconds =
    (daysInMonths + days) * SECONDS_IN_DAY + minutes * SECONDS_IN_MINUTE + hours * SECONDS_IN_HOUR;

  return durationInSeconds;
};

export const getTokensPerSecondCount = (
  meta: TokenMetadata,
  deposit: number,
  durationInSeconds: number,
) => {
  const depositInYocto = toYocto(meta.decimals, deposit);
  const value = new BigNumber(depositInYocto).dividedToIntegerBy(durationInSeconds).toFixed();

  return value !== 'Infinity' && value !== 'NaN' ? value : '0';
};

export const getStreamingSpeed = (speedInSeconds: number | string, token: RichToken): string => {
  if (Number(speedInSeconds) <= 0) {
    return 'none';
  }

  const {meta} = token;
  const {formattedValue, unit} = tokensPerMeaningfulPeriod(meta.decimals, speedInSeconds);

  return `${formattedValue} ${meta.symbol} / ${unit}`;
};

export const isReceiverNotEqualOwnerFx = attach({
  source: $accountId,
  effect: (accountId, value: string | undefined) => !!accountId && value !== accountId,
});

export const isAddressExistsFx = attach({
  source: $nearWallet,
  async effect(wallet, value: string | undefined) {
    if (!wallet || !value) return false;
    try {
      const result = await wallet.near.connection.provider.query({
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
