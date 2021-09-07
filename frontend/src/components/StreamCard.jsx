import classNames from 'classnames';
import React from 'react';
import numbro from 'numbro';
import {StreamIn, StreamOut} from './icons';
import {intervalToDuration, formatDuration} from 'date-fns';

const streamType = {
  auto_deposit_enabled: false,
  available_to_withdraw: '1664007039581600000000000',
  balance: '10000000000000000000000000',
  description: 'blabla',
  owner_id: 'pinkinice.testnet',
  receiver_id: 'pinkinice2.testnet',
  status: 'ACTIVE',
  stream_id: '14px69Go9gwxmmZQ3aWjdEyUeQgAYHRByJf23vLaDe82',
  timestamp_created: '1630936004627180400',
  token_name: 'NEAR',
  tokens_per_tick: '400000000000',
};

const tokens = {
  NEAR: {
    decimals: 24,
  },
  TARAS: {
    decimals: 18,
  },
  fallback: {
    decimals: 18,
  },
};

const TokenFormatter = (token = tokens.fallback) => {
  const TICK_TO_MS = Math.pow(10, 6);
  const MP = Math.pow(10, token.decimals);

  return {
    amount: (amount) =>
      numbro(amount).divide(MP).format({
        mantissa: 2,
      }),
    perTick: (speed) =>
      numbro(speed)
        .multiply(TICK_TO_MS)
        .divide(MP)
        .format({
          mantissa: token.decimals - 6,
          trimMantissa: true,
        }),
    ticksToMs: (ticks) => Math.round(ticks / TICK_TO_MS),
  };
};

export function StreamCard({stream = streamType, direction, className}) {
  let token = tokens[stream.token_name] || tokens.fallback;

  const tf = TokenFormatter(token);

  const secondsLeft = tf.ticksToMs(
    Math.round(
      (stream.balance - stream.available_to_withdraw) / stream.tokens_per_tick,
    ),
  );

  const dateEnd = new Date(new Date().getTime() + secondsLeft);
  const duration = intervalToDuration({start: new Date(), end: dateEnd});
  const formatted = formatDuration(duration);

  return (
    <div
      className={classNames(
        'twind-p-10 twind-bg-input twind-rounded-3xl',
        className,
      )}
    >
      <div>
        <div className="twind-flex twind-items-center">
          <div className="twind-w-8 twind-h-8 twind-rounded-lg twind-bg-card2 twind-inline-flex twind-items-center twind-justify-center twind-mr-4">
            I
          </div>
          <div className="twind-flex twind-items-end">
            <div className="twind-text-2xl">
              {tf.amount(stream.available_to_withdraw)} of{' '}
              {tf.amount(stream.balance)}{' '}
              <span className="twind-uppercase">{stream.token_name}</span>
            </div>

            <div className="twind-inline-flex twind-items-center twind-ml-4">
              {direction === 'out' ? <StreamOut /> : <StreamIn />}
              <span className="twind-ml-2">
                <span>@{tf.perTick(stream.tokens_per_tick)}</span>
                <span> {stream.token_name} / Sec</span>
              </span>
            </div>

            <div className="twind-ml-6">{formatted}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
