import React from 'react';

import {useRoketoContext} from 'app/roketo-context';
import {getBalancePerDesiredPeriod} from 'shared/helpers/speed';

import {TIME_PERIOD_SIGNS, TimePeriod} from 'shared/constants';

const TOKEN_FIELD_MAP: {
  [type: string]: 'total_incoming' | 'total_outgoing',
} = {
  income: 'total_incoming',
  outcome: 'total_outgoing',
};

type Props = {
  type: 'income' | 'outcome',
  period: TimePeriod,

  className?: string,
}

export const TokenAmountSpeed = ({type, period, className}: Props) => {
  const desiredField = TOKEN_FIELD_MAP[type];

  const {roketo, priceOracle} = useRoketoContext();

  const tokensBalanceMap = roketo.account[desiredField];
  const tokenAccountIds = Object.keys(tokensBalanceMap);

  const totalAmountInUSD = tokenAccountIds.reduce((total, tokenAccountId) => {
    // const {formatter} = tokens[tokenAccountId];

    const balancePerSec = Number(tokensBalanceMap[tokenAccountId]);
    const balancePerDesiredPeriod = getBalancePerDesiredPeriod(balancePerSec, period);

    const usdAmount = priceOracle.getPriceInUsd(tokenAccountId, balancePerDesiredPeriod);

    return total + Number(usdAmount);
  }, 0);

  return (
    <div className={className}>
      {`${totalAmountInUSD} $ ${TIME_PERIOD_SIGNS[period]}`}
    </div>
  );
};
