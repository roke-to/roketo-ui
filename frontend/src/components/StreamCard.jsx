import classNames from 'classnames';
import React from 'react';
import {StreamIn, StreamOut} from './icons';
import {TokenFormatter} from '../lib/formatting';
import {ProgressBar} from './kit';
import {StreamControls, StreamDepositButton} from '../features/stream-control';
import {DurationTimer} from '../components/DurationTimer';

const streamType = {
  stream_id: 'FnVkAYZu4XED3o44pZPvrnghVEMxo3GiHszUT4orjYST',
  description: 'test stream',
  owner_id: 'kpr.testnet',
  receiver_id: 'pinkinice.testnet',
  token_name: 'NEAR',
  timestamp_created: '1630964802206727665',
  balance: '3472735225910300000000000',
  tokens_per_tick: '100000000000',
  auto_deposit_enabled: false,
  status: 'ACTIVE',
  tokens_total_withdrawn: '27264774089700000000000',
  available_to_withdraw: '3472735225910300000000000',
  history: [
    {
      actor: 'dev-1630964633889-96006156236045',
      action_type: 'Deposit',
      amount: '3500000000000000000000000',
      timestamp: '1630964802206727665',
    },
  ],
  direction: 'in',
};

export function StreamCard({stream = streamType, direction, className}) {
  const tf = TokenFormatter(stream.token_name);

  // time left calculations
  const secondsLeft = tf.ticksToMs(
    Math.round(
      (stream.balance - stream.available_to_withdraw) / stream.tokens_per_tick,
    ),
  );
  const dateEnd = new Date(new Date().getTime() + secondsLeft);

  // progress bar calculations
  const full = Number(stream.balance) + Number(stream.tokens_total_withdrawn);
  const withdrawn = Number(stream.tokens_total_withdrawn);
  const tokensStreamed =
    Number(stream.tokens_total_withdrawn) +
    Number(stream.available_to_withdraw);

  const progresses = [withdrawn / full, tokensStreamed / full];

  return (
    <div
      className={classNames(
        'twind-grid twind-grid-cols-12 twind-gap-6 twind-justify-items-center',
        'twind-p-10 twind-bg-input twind-rounded-3xl',
        className,
      )}
    >
      <div className="twind-w-full twind-col-span-12 xl:twind-col-span-5 2xl:twind-col-span-6 twind-justify-self-start">
        <div className="twind-flex twind-items-center">
          <div className="twind-w-8 twind-h-8 twind-flex-shrink-0 twind-rounded-lg twind-bg-card2 twind-inline-flex twind-items-center twind-justify-center twind-mr-4">
            I
          </div>
          <div className="twind-w-full twind-gap-4 twind-flex twind-items-end">
            <div className="twind-text-2xl twind-whitespace-nowrap twind-flex-shrink-0">
              {tf.amount(tokensStreamed)} of {tf.amount(full)}{' '}
              <span className="twind-uppercase">{stream.token_name}</span>
            </div>

            <div className="twind-inline-flex twind-items-center twind-whitespace-nowrap">
              {direction === 'out' ? <StreamOut /> : <StreamIn />}
              <span className="twind-ml-2">
                <span>@{tf.tokensPerS(stream.tokens_per_tick)}</span>
                <span> {stream.token_name} / Sec</span>
              </span>
            </div>

            <div className="twind-whitespace-nowrap">
              <DurationTimer untilDate={dateEnd} />
            </div>
          </div>
        </div>
        <ProgressBar className="twind-mt-5" progresses={progresses} />
      </div>
      <div className="twind-col-span-2">
        <div className="twind-text-gray">Receiver:</div>
        <div>{stream.receiver_id}</div>
      </div>
      <div className="twind-col-span-2">
        <div className="twind-text-gray">Status:</div>
        <StreamControls stream={stream} />
      </div>
      <div className="twind-col-span-2">
        {direction === 'out' ? <StreamDepositButton stream={stream} /> : null}
      </div>
    </div>
  );
}
