import React from 'react';
import classNames from 'classnames';
import { format, formatDuration, intervalToDuration } from 'date-fns';
import numbro from 'numbro';
import copy from 'clipboard-copy';

import { useRoketoContext } from 'app/roketo-context';
import { CopyIcon } from 'shared/icons/Copy';
import { useTokenFormatter } from 'shared/hooks/useTokenFormatter';
import { shortEnLocale } from 'shared/helpers/date';
import { DurationTimer } from 'shared/components/DurationTimer';
import { isIdling, streamDirection, getEmptyAccount, getEmptyStream } from 'shared/api/roketo/helpers';
import { RoketoStream, RoketoAccount } from 'shared/api/roketo/interfaces/entities';

import { StreamingSpeed } from './StreamingSpeed';
import { streamViewData } from './streamViewData';

type DataWrapperProps = {
  label: string;
  children: React.ReactNode;
  className?: string;
}

function VerticalData({ label, children, className }: DataWrapperProps) {
  return (
    <div className={className}>
      <div className="text-gray text-sm">{label}</div>
      <div className="font-semibold text-lg break-words select-all">
        {children}
      </div>
    </div>
  );
}

function HorizontalData({ label, children, className }: DataWrapperProps) {
  return (
    <div className={classNames('flex justify-between my-3', className)}>
      <div className="text-gray text-sm">{label}</div>
      <div className="text-sm text-right">{children}</div>
    </div>
  );
}

type StreamOverviewCardProps = {
  stream?: RoketoStream;
  account?: RoketoAccount;
  className: string;
};

export function StreamOverviewCard({
  stream = getEmptyStream(),
  account = getEmptyAccount(),
  className,
  ...rest
}: StreamOverviewCardProps) {
  const { roketo } = useRoketoContext();
  const tf = useTokenFormatter(stream.ticker);
  const {
    dateEnd,
    percentages,
    timestampEnd,
    progress: {
      full, streamed, left, available,
    },
  } = streamViewData(stream, tf);

  const duration = intervalToDuration({
    start: new Date(),
    end: dateEnd,
  });
  const timeLeft = formatDuration(duration, {
    locale: shortEnLocale,
  });
  const direction = streamDirection({
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
        {format(new Date(Number(stream.timestamp_created) / 1000000), 'Yo MMM do')}
      </HorizontalData>
      <HorizontalData label="Token:">{stream.ticker}</HorizontalData>
      <HorizontalData label="Total:">
        {tf.amount(full)}
        {' '}
        {stream.ticker}
      </HorizontalData>
      <HorizontalData label="Tokens Transferred:">
        <span>
          {tf.amount(streamed)}
          {' '}
          {stream.ticker}
          {' '}
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
          {tf.amount(left)}
          {' '}
          {stream.ticker}
          {' '}
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
        {tf.amount(available)}
        {' '}
        {stream.ticker}
      </HorizontalData>
      <HorizontalData label="Stream update & withdrawal fee:">
        {tf.amount(
          (Number(stream.available_to_withdraw)
            * (roketo.tokenMeta(stream.ticker)?.commission_percentage || 0))
            / 100,
        )}
        {' '}
        {stream.ticker}
        {' '}
        <span className="text-gray">
          (
          {numbro(
            roketo.tokenMeta(stream.ticker)?.commission_percentage || 0 / 100,
          ).format({
            output: 'percent',
            mantissa: 2,
          })}
          )
        </span>
      </HorizontalData>
      <HorizontalData label="Speed:">
        <StreamingSpeed stream={stream} />
      </HorizontalData>

      {direction === 'in' ? (
        <HorizontalData label="Latest Withdrawal:">
          {format(new Date(Number(account.last_action) / 1000000), 'MMM dd, Yo  H:m')}
        </HorizontalData>
      ) : (
        ''
      )}

      <HorizontalData label="Stream ID:">
        <div className="inline-block w-24 overflow-ellipsis overflow-hidden">
          {stream.id}
        </div>
        <button
          type="button"
          onClick={() => copy(stream.id)}
          className="hover:text-blue"
        >
          <CopyIcon />
        </button>
      </HorizontalData>
    </div>
  );
}
