import React from 'react';

import {useRoketoContext} from 'app/roketo-context';
import {getBalancePerDesiredPeriod} from 'shared/helpers/speed';

import {TIME_PERIOD_SIGNS, TimePeriod} from 'shared/constants';

export enum StreamType {
  income = 'total_incoming',
  outcome = 'total_outgoing',
}

type Props = {
  type: StreamType,
  period: TimePeriod,

  className?: string,
}

export const TokenAmountSpeed = ({type, period, className}: Props) => {
  const {roketo, priceOracle, tokens} = useRoketoContext();

  const tokensBalanceMap = roketo.account[type];
  const tokenAccountIds = Object.keys(tokensBalanceMap);

  const totalAmountInUSD = tokenAccountIds.reduce((total, tokenAccountId) => {
    const {formatter} = tokens[tokenAccountId];

    const balancePerSec = tokensBalanceMap[tokenAccountId];

    const balancePerDesiredPeriod = getBalancePerDesiredPeriod(balancePerSec, period).toFixed();
    const formattedBalance = formatter.toHumanReadableValue(balancePerDesiredPeriod, 3);

    const usdAmount = priceOracle.getPriceInUsd(tokenAccountId, formattedBalance);

    return total + Number(usdAmount);
  }, 0);

  return (
    <div className={className}>
      {`${totalAmountInUSD} $ ${TIME_PERIOD_SIGNS[period]}`}
    </div>
  );
};
