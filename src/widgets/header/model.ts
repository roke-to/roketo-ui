import {combine} from 'effector';

import {$priceOracle, $roketoWallet} from '~/entities/wallet';

import {toHumanReadableValue} from '~/shared/api/ft/token-formatter';
import {TimePeriod} from '~/shared/constants';
import {getBalancePerDesiredPeriod} from '~/shared/lib/speed';

import {StreamType} from './streamType';

export const $totalUSDAmountPerHour = combine(
  $roketoWallet,
  $priceOracle,
  (wallet, priceOracle) => {
    if (!wallet)
      return {
        [StreamType.income]: 0,
        [StreamType.outcome]: 0,
      };
    const {roketoAccount, tokens} = wallet;
    const {getPriceInUsd} = priceOracle;
    function calculateTotalAmount(type: StreamType) {
      const tokensBalanceMap = roketoAccount[type];
      const tokenAccountIds = Object.keys(tokensBalanceMap);

      return tokenAccountIds.reduce((total, tokenAccountId) => {
        const {meta} = tokens[tokenAccountId];

        const balancePerSec = tokensBalanceMap[tokenAccountId];

        const balancePerDesiredPeriod = getBalancePerDesiredPeriod(
          balancePerSec,
          TimePeriod.Hour,
        ).toFixed();
        const formattedBalance = toHumanReadableValue(meta.decimals, balancePerDesiredPeriod, 3);

        const usdAmount = getPriceInUsd(tokenAccountId, formattedBalance);

        return total + Number(usdAmount);
      }, 0);
    }
    return {
      [StreamType.income]: calculateTotalAmount(StreamType.income),
      [StreamType.outcome]: calculateTotalAmount(StreamType.outcome),
    };
  },
);
