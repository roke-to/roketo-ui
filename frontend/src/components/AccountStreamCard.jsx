import React from 'react';
import {tokens, TokenFormatter} from '../lib/formatting';
import {utils} from 'near-api-js';
import numbro from 'numbro';

export function AccountStreamCard({
  token,
  balance,
  streamsLength,
  period = '',
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
    <div className="twind-w-full twind-h-24 twind-rounded-lg twind-bg-card2 twind-flex twind-items-center twind-width-full twind-p-6 twind-mr-4">
      <div className="twind-w-full twind-flex twind-items-center">
        <div className="twind-w-12 twind-mr-12">icon</div>
        <div className="">
          <div className="twind-font-bold">
            {tokens[token].name}, {token}
          </div>
          <div className="twind-text-gray twind-text-sm">
            from {streamsLength} steams
          </div>
        </div>
        <div className="twind-ml-auto">
          <span className=" twind-text-3xl">
            {balance < 0.001 ? '<0.001' : numbro(balance).format({mantissa: 3})}
          </span>
          <span>{period !== '' ? '/' + period : ''}</span>
        </div>
      </div>
    </div>
  );
}
