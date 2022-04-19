import React from 'react';
import classNames from 'classnames';
import { format } from 'date-fns';
import numbro from 'numbro';
import copy from 'clipboard-copy';
import BigNumber from 'bignumber.js';

import { CopyIcon } from 'shared/icons/Copy';
import { fromNanosecToMilisec } from 'shared/helpers/date';
import { getEmptyStream } from 'shared/api/roketo/helpers';
import { RoketoStream } from 'shared/api/roketo/interfaces/entities';
import { useGetStreamDirection, STREAM_DIRECTION } from 'shared/hooks/useGetStreamDirection';
import { useToken } from 'shared/hooks/useToken';

import {streamLib} from 'entites/stream';

import { StreamingSpeed } from './StreamingSpeed';

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
  className: string;
};

export function StreamOverviewCard({
  stream = getEmptyStream(),
  className
}: StreamOverviewCardProps) {
  const {
    percentages,
    timeLeft,
    progress: {
      full, streamed, left, available,
    },
  } = streamLib.streamViewData(stream);

  const direction = useGetStreamDirection(stream);
  const { meta, formatter, roketoMeta } = useToken(stream.token_account_id);
  const commissionPercentage = new BigNumber(roketoMeta.commission_coef.val)
    .shiftedBy(roketoMeta.commission_coef.pow)
    .toNumber();

  return (
    <div className={classNames('pt-10 p-9 bg-input rounded-3xl', className)}>
      <div className="flex text-center justify-between">
        {direction === STREAM_DIRECTION.IN ? (
          <VerticalData label="Sender:" className="w-1/2 mr-4">
            {stream.owner_id}
          </VerticalData>
        ) : (
          <VerticalData label="Receiver:" className="w-1/2 mr-4">
            {stream.receiver_id}
          </VerticalData>
        )}

        <VerticalData label="Time Remaining:" className="w-1/2">
          {timeLeft || 'Finished'}
        </VerticalData>
      </div>
      <div className="border-t border-border mt-8 mb-9" />
      <HorizontalData label="Stream Created:">
        {format(new Date(Number(stream.timestamp_created) / 1000000), 'Yo MMM do')}
      </HorizontalData>
      <HorizontalData label="Token:">{meta.symbol}</HorizontalData>
      <HorizontalData label="Total:">
        {formatter.amount(full)}
        {' '}
        {meta.symbol}
      </HorizontalData>
      <HorizontalData label="Tokens Transferred:">
        <span>
          {formatter.amount(streamed)}
          {' '}
          {meta.symbol}
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
          {formatter.amount(left)}
          {' '}
          {meta.symbol}
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
        {formatter.amount(available)}
        {' '}
        {meta.symbol}
      </HorizontalData>
      <HorizontalData label="Stream update & withdrawal fee:">
        {formatter.amount(
          Number(available) * (commissionPercentage || 0) / 100
        )}
        {' '}
        {meta.symbol}
        {' '}
        <span className="text-gray">
          (
          {numbro(
            commissionPercentage || 0 / 100,
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
          {format(new Date(fromNanosecToMilisec(stream.last_action)), 'MMM dd, Yo  H:m')}
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
