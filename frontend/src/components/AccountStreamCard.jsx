import React from 'react';
import {utils} from 'near-api-js';
import numbro from 'numbro';
import classNames from 'classnames';
import {useNear} from '../features/near-connect/useNear';
import {TokenImage} from './kit/TokenImage';

export function AccountStreamCard({
  token,
  balance,
  streamsLength,
  period = '',
  showPeriod = true,
  className,
}) {
  const near = useNear();
  const tokenMeta = near.tokens.get(token);
  console.debug(tokenMeta);
  let multiplier = 1;
  switch (period) {
    case 'min':
      multiplier = 60;
      break;
    case 'hour':
      multiplier = 60 * 60;
      break;
    case 'day':
      multiplier = 60 * 60 * 24;
      break;

    // no default
  }

  balance = utils.format.formatNearAmount(balance);

  balance = balance * multiplier;

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
              <TokenImage tokenName={token} />
            </span>
          </div>
          <div className="">
            <div className="font-bold">
              {tokenMeta.metadata.name}, {token}
            </div>
            {streamsLength > 0 ? (
              <div className="text-gray text-sm">
                from {streamsLength} steams
              </div>
            ) : (
              ''
            )}
          </div>
        </div>

        <div className="ml-auto lg:mt-0 mt-4">
          <span className=" text-3xl">
            {balance < 0.001 ? '<0.001' : numbro(balance).format({mantissa: 3})}
          </span>
          {showPeriod ? <span>{period !== '' ? '/' + period : ''}</span> : ''}
        </div>
      </div>
    </div>
  );
}
