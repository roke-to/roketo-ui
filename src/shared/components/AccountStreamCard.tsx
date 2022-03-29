import React from 'react';
import numbro from 'numbro';
import classNames from 'classnames';

import { TokenImage } from 'shared/kit/TokenImage';
import { SECONDS_IN_MINUTE, SECONDS_IN_HOUR, SECONDS_IN_DAY } from 'shared/api/roketo/constants';
import { useRoketoContext } from 'app/roketo-context';

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
  token: string;
  balance: string;
  streamsLength: number;
  period: string;
  showPeriod: boolean;
  className: string;
};

export function AccountStreamCard({
  token,
  balance,
  streamsLength,
  period = '',
  showPeriod = true,
  className,
}: AccountStreamCardProps) {
  const { tokens } = useRoketoContext();

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
              <TokenImage tokenAccountId={token} />
            </span>
          </div>
          <div className="">
            <div className="font-bold">
              {tokens[token].meta.symbol}
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
            {Number(balanceValue) < 0.001 ? '<0.001' : numbro(balanceValue).format({ mantissa: 3 })}
          </span>
          {showPeriod ? <span>{period !== '' ? `/${period}` : ''}</span> : ''}
        </div>
      </div>
    </div>
  );
}
