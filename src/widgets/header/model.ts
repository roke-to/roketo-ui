import {combine} from 'effector';
import {$roketoWallet, $priceOracle} from '~/entities/wallet';
import {TimePeriod} from '~/shared/constants';
import {getBalancePerDesiredPeriod} from '~/shared/lib/speed';
import {StreamType} from './streamType';

export const $totalUSDAmountPerHour = combine(
  $roketoWallet,
  $priceOracle,
  (wallet, priceOracle) => {
    if (!wallet || !priceOracle)
      return {
        [StreamType.income]: 0,
        [StreamType.outcome]: 0,
      };
    const {roketo, tokens} = wallet;
    const {getPriceInUsd} = priceOracle;
    function calculateTotalAmount(type: StreamType) {
      const tokensBalanceMap = roketo.account[type];
      const tokenAccountIds = Object.keys(tokensBalanceMap);

      return tokenAccountIds.reduce((total, tokenAccountId) => {
        const {formatter} = tokens[tokenAccountId];

        const balancePerSec = tokensBalanceMap[tokenAccountId];

        const balancePerDesiredPeriod = getBalancePerDesiredPeriod(
          balancePerSec,
          TimePeriod.Hour,
        ).toFixed();
        const formattedBalance = formatter.toHumanReadableValue(
          balancePerDesiredPeriod,
          3,
        );

        const usdAmount = getPriceInUsd(tokenAccountId, formattedBalance);

        return total + Number(usdAmount);
      }, 0);
    }
    return {
      [StreamType.income]: calculateTotalAmount(StreamType.income),
      [StreamType.outcome]: calculateTotalAmount(StreamType.income),
    };
  },
);
