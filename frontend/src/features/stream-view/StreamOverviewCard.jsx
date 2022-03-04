import React from 'react';
import {isIdling, StreamingSpeed, streamViewData} from '.';
import {DurationTimer} from '../../components/DurationTimer';
import classNames from 'classnames';
import {format, formatDuration} from 'date-fns';
import numbro from 'numbro';
import {streamDirection} from '.';
import {Copy} from '../../components/icons';
import copy from 'clipboard-copy';
import {useNear} from '../near-connect/useNear';
import {useTokenFormatter} from '../../lib/useTokenFormatter';
import {intervalToDuration} from 'date-fns/esm';
import {shortEnLocale} from '../../lib/date';

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

const VerticalData = ({label, children, ...rest}) => (
  <div {...rest}>
    <div className="text-gray text-sm">{label}</div>
    <div className="font-semibold text-lg break-words select-all">
      {children}
    </div>
  </div>
);

const HorizontalData = ({label, children, className, ...rest}) => (
  <div className={classNames('flex justify-between my-3', className)} {...rest}>
    <div className="text-gray text-sm">{label}</div>
    <div className="text-sm text-right">{children}</div>
  </div>
);

export function StreamOverviewCard({
  stream = streamType,
  account,
  className,
  ...rest
}) {
  const near = useNear();
  const tf = useTokenFormatter(stream.ticker);
  const {
    dateEnd,
    percentages,
    timestampEnd,
    progress: {full, streamed, left, available},
  } = streamViewData(stream, tf);

  const duration = intervalToDuration({
    start: new Date(),
    end: dateEnd,
  });
  let timeLeft = formatDuration(duration, {
    locale: shortEnLocale,
  });
  let direction = streamDirection({
    stream,
    account,
  });

  return (
    <div
      className={classNames('pt-10 p-9 bg-input rounded-3xl', className)}
      {...rest}
    >
      <div className="flex text-center justify-between">
        {direction === 'in' ? (
          <VerticalData label="Sender:" className="w-1/2 mr-4">
            {stream.owner_id}
          </VerticalData>
        ) : (
          <VerticalData label="Receiver:" className="w-1/2 mr-4">
            {stream.receiver_id}
          </VerticalData>
        )}

        <VerticalData label="Time Remaining:" className="w-1/2">
          {isIdling(stream) ? (
            timeLeft
          ) : (
            <DurationTimer
              untilTimestamp={timestampEnd}
              finishedText="Finished"
            />
          )}
        </VerticalData>
      </div>
      <div className="border-t border-border mt-8 mb-9" />
      <HorizontalData label="Stream Created:">
        {format(new Date(stream.timestamp_created / 1000000), 'Yo MMM do')}
      </HorizontalData>
      <HorizontalData label="Token:">{stream.ticker}</HorizontalData>
      <HorizontalData label="Total:">
        {tf.amount(full)} {stream.ticker}
      </HorizontalData>
      <HorizontalData label="Tokens Transferred:">
        <span>
          {tf.amount(streamed)} {stream.ticker}{' '}
          <span className="text-gray">
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
          {tf.amount(left)} {stream.ticker}{' '}
          <span className="text-gray">
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
        {tf.amount(available)} {stream.ticker}
      </HorizontalData>
      <HorizontalData label="Stream update & withdrawal fee:">
        {tf.amount(
          (stream.available_to_withdraw *
            near.roketo.tokenMeta(stream.ticker).commission_percentage) /
            100,
        )}{' '}
        {stream.ticker}{' '}
        <span className="text-gray">
          (
          {numbro(
            near.roketo.tokenMeta(stream.ticker).commission_percentage / 100,
          ).format({
            output: 'percent',
            mantissa: 2,
          })}
          )
        </span>
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
        {stream.is_auto_deposit_enabled ? 'Enabled' : 'Disabled'}
      </HorizontalData>

      <HorizontalData label="Stream ID:">
        <div className="inline-block w-24 overflow-ellipsis overflow-hidden">
          {stream.id}
        </div>
        <button onClick={() => copy(stream.id)} className="hover:text-blue">
          <Copy />
        </button>
      </HorizontalData>
    </div>
  );
}
