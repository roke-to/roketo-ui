import React from 'react';
import {StreamingSpeed, streamViewData} from '.';
import {DurationTimer} from '../../components/DurationTimer';
import classNames from 'classnames';
import {format} from 'date-fns';
import numbro from 'numbro';
import {streamDirection} from '.';
import {Copy} from '../../components/icons';
import copy from 'clipboard-copy';
import {STREAM_STATUS} from '../stream-control/lib';

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

const VerticalData = ({label, children}) => (
  <div>
    <div className="twind-text-gray twind-text-sm">{label}</div>
    <div className="twind-font-semibold twind-text-lg">{children}</div>
  </div>
);

const HorizontalData = ({label, children}) => (
  <div className="twind-flex twind-justify-between twind-my-3">
    <div className="twind-text-gray twind-text-sm">{label}</div>
    <div className="twind-text-sm twind-text-right">{children}</div>
  </div>
);

export function StreamOverviewCard({
  stream = streamType,
  account,
  className,
  ...rest
}) {
  const {
    tf,
    percentages,
    timestampEnd,
    progress: {full, streamed, withdrawn, left, available},
  } = streamViewData(stream);

  let direction = streamDirection({
    stream,
    account,
  });

  return (
    <div
      className={classNames(
        'twind-pt-10 twind-p-9 twind-bg-input twind-rounded-3xl',
        className,
      )}
      {...rest}
    >
      <div className="twind-flex twind-text-center twind-justify-between">
        <VerticalData label="Receiver:">{stream.receiver_id}</VerticalData>

        <VerticalData label="Time Remaining:">
          {stream.status === STREAM_STATUS.PAUSED ? (
            'Paused'
          ) : (
            <DurationTimer
              untilTimestamp={timestampEnd}
              finishedText="Finished"
            />
          )}
        </VerticalData>
      </div>
      <div className="twind-border-t twind-border-border twind-mt-8 twind-mb-9" />
      <HorizontalData label="Stream Created:">
        {format(new Date(stream.timestamp_created / 1000000), 'Yo')}
      </HorizontalData>
      <HorizontalData label="Token:">{stream.token_name}</HorizontalData>
      <HorizontalData label="Total:">
        {tf.amount(full)} {stream.token_name}
      </HorizontalData>
      <HorizontalData label="Tokens Transferred:">
        <span>
          {tf.amount(streamed)} {stream.token_name}{' '}
          <span className="twind-text-gray">
            (
            {numbro(percentages.streamed).format({
              output: 'percent',
              mantissa: 2,
            })}
            )
          </span>
        </span>
      </HorizontalData>
      <HorizontalData label="Tokens Left:">
        <span>
          {tf.amount(left)} {stream.token_name}{' '}
          <span className="twind-text-gray">
            (
            {numbro(percentages.left).format({
              output: 'percent',
              mantissa: 2,
            })}
            )
          </span>
        </span>
      </HorizontalData>
      <HorizontalData label="Tokens Available:">
        {tf.amount(available)} {stream.token_name}
      </HorizontalData>
      <HorizontalData label="Speed:">
        <StreamingSpeed stream={stream} direction={null} />
      </HorizontalData>

      {direction === 'in' ? (
        <HorizontalData label="Latest Withdrawal:">
          {format(new Date(account.last_action / 1000000), 'MMM dd, Yo  H:m')}
        </HorizontalData>
      ) : (
        ''
      )}
      <HorizontalData label="Auto-deposit:">
        {stream.auto_deposit_enabled ? 'Enabled': 'Disabled'}
      </HorizontalData>

      <HorizontalData label="Stream ID:">
        <div className="twind-inline-block twind-w-24 twind-overflow-ellipsis twind-overflow-hidden">
          {stream.stream_id}
        </div>
        <button
          onClick={() => copy(stream.stream_id)}
          className="hover:twind-text-blue"
        >
          <Copy />
        </button>
      </HorizontalData>
    </div>
  );
}
