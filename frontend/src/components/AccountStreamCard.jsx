import React from 'react';
import {tokens, TokenFormatter} from '../lib/formatting';
import {utils} from 'near-api-js';
import numbro from 'numbro';
import {Tokens} from './icons';

export function AccountStreamCard({
  token,
  balance,
  streamsLength,
  period = '',
  showPeriod = true,
}) {
  const formatter = TokenFormatter(token);

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
  }

  balance = utils.format.formatNearAmount(balance);

  balance = balance * multiplier;

  return (
    <div className="twind-w-full twind-h-24 twind-rounded-lg twind-bg-input twind-flex twind-items-center twind-width-full twind-p-6 twind-mr-4">
      <div className="twind-w-full twind-flex twind-items-center">
        <div className="twind-w-12 twind-mr-12">
          <span className="twind-flex-shrink-0 twind-rounded-full twind-bg-card2 twind-inline-flex twind-items-center twind-justify-center twind-w-12 twind-h-12">
            {Tokens(token)}
          </span>
        </div>
        <div className="">
          <div className="twind-font-bold">
            {tokens[token].name}, {token}
          </div>
          {streamsLength > 0 ? (
            <div className="twind-text-gray twind-text-sm">
              from {streamsLength} steams
            </div>
          ) : (
            ''
          )}
        </div>
        <div className="twind-ml-auto">
          <span className=" twind-text-3xl">
            {balance < 0.001 ? '<0.001' : numbro(balance).format({mantissa: 3})}
          </span>
          {showPeriod ? <span>{period !== '' ? '/' + period : ''}</span> : ''}
        </div>
      </div>
    </div>
  );
}
