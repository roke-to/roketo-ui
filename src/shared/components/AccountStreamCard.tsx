import React from 'react';
import classNames from 'classnames';

import { TokenImage } from 'shared/kit/TokenImage';
import { SECONDS_IN_MINUTE, SECONDS_IN_HOUR, SECONDS_IN_DAY } from 'shared/constants';
import { useToken } from 'shared/hooks/useToken';

function multiplyAmountByTimePeriod(amount: number, period: string) {
  switch (period) {
    case 'min':
      return amount * SECONDS_IN_MINUTE;
    case 'hour':
      return amount * SECONDS_IN_HOUR;
    case 'day':
      return amount * SECONDS_IN_DAY;
    default:
      return amount;
  }
}

type AccountStreamCardProps = {
  tokenAccountId: string;
  balance: string;
  streamsLength: number;
  period: string;
  showPeriod: boolean;
  className: string;
};

export function AccountStreamCard({
  tokenAccountId,
  balance,
  streamsLength,
  period = '',
  showPeriod = true,
  className,
}: AccountStreamCardProps) {
  const { formatter, meta } = useToken(tokenAccountId);

  const balanceValue = multiplyAmountByTimePeriod(Number(balance), period);

  return (
    <div
      className={classNames(
        'w-full rounded-lg bg-input flex items-center width-full p-6',
        className,
      )}
    >
      <div className="w-full lg:flex items-center">
        <div className="flex items-center">
          <div className="w-12 mr-4">
            <span className="flex-shrink-0 rounded-full bg-card2 inline-flex items-center justify-center w-12 h-12">
              <TokenImage tokenAccountId={tokenAccountId} />
            </span>
          </div>
          <div className="">
            <div className="font-bold">
              {meta.symbol}
            </div>
            {streamsLength > 0 ? (
              <div className="text-gray text-sm">
                from
                {' '}
                {streamsLength}
                {' '}
                steams
              </div>
            ) : (
              ''
            )}
          </div>
        </div>

        <div className="ml-auto lg:mt-0 mt-4">
          <span className=" text-3xl">
            {formatter.amount(balanceValue)}
          </span>
          {showPeriod ? <span>{period !== '' ? `/${period}` : ''}</span> : ''}
        </div>
      </div>
    </div>
  );
}
