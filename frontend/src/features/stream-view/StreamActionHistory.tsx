import React from 'react';
import { format } from 'date-fns';
import classNames from 'classnames';

import { timestamp } from 'shared/helpers/formatting';
import { useTokenFormatter } from 'shared/hooks/useTokenFormatter';
import { STREAM_ACTION_TYPE } from 'shared/api/roketo/constants';
import type { RoketoStream, StreamAction } from 'shared/api/roketo/interfaces/entities';

type ThCellProps = {
  children: React.ReactNode;
  className?: never;
};

function ThCell({ children, className, ...rest }: ThCellProps) {
  return (
    <th
      className={classNames('text-gray font-normal text-left p-4', className)}
      {...rest}
    >
      {children}
    </th>
  );
}

type TdCellProps = {
  children?: React.ReactNode;
  className?: string;
};

function TdCell({ children, className, ...rest }: TdCellProps) {
  return (
    <td
      className={classNames(
        'first:rounded-l-xl last:rounded-r-xl p-4 font-normal text-left h-14 bg-input',
        className,
      )}
      {...rest}
    >
      {children}
    </td>
  );
}

const ACTION_TYPE_COLOR = {
  [STREAM_ACTION_TYPE.INIT]: 'text-special-active',
  [STREAM_ACTION_TYPE.DEPOSIT]: 'text-special-active',
  [STREAM_ACTION_TYPE.START]: 'text-special-active',
  [STREAM_ACTION_TYPE.WITHDRAW]: 'text-special-hold',
  [STREAM_ACTION_TYPE.PAUSE]: 'text-special-inactive',
  [STREAM_ACTION_TYPE.STOP]: 'text-special-inactive',
} as const;

type ActionTypeProps = {
  actionType: keyof typeof ACTION_TYPE_COLOR;
  className?: never;
};

function ActionType({ actionType, className, ...rest }: ActionTypeProps) {
  return (
    <span
      className={classNames(ACTION_TYPE_COLOR[actionType], className)}
      {...rest}
    >
      {actionType}
    </span>
  );
}

type StreamActionHistoryProps = {
  stream: RoketoStream;
  history: StreamAction[];
  currentPage: number;
  onNextPageClick: () => void;
  onPrevPageClick: () => void;
  maxPage: number;
  pageSize: number;
  loading: boolean;
  className: string;
};

export function StreamActionHistory({
  stream,
  history,
  currentPage,
  onNextPageClick,
  onPrevPageClick,
  maxPage,
  pageSize,
  loading,
  className,
  ...rest
}: StreamActionHistoryProps) {
  const tf = useTokenFormatter(stream.ticker);

  return (
    <div className={classNames('border-separate Table', className)} {...rest}>
      <table className="border-separate Table w-full">
        <thead>
          <tr>
            <ThCell>Actor</ThCell>
            <ThCell>Action Type</ThCell>
            <ThCell>Amount</ThCell>
            <ThCell>Commission</ThCell>
            <ThCell>Timestamp</ThCell>
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array(pageSize)
              .fill(null)
              .map((_, i) => ( // eslint-disable-next-line react/no-array-index-key
                <tr className="mb-2" key={i}>
                  <TdCell />
                  <TdCell />
                  <TdCell />
                  <TdCell />
                  <TdCell />
                </tr>
              ))
            : history.map((entry) => (
              <tr className="mb-2" key={entry.timestamp + entry.action_type}>
                <TdCell className="break-all w-42">{entry.actor}</TdCell>
                <TdCell>
                  <ActionType actionType={entry.action_type} />
                </TdCell>
                <TdCell>
                  {entry.amount
                    ? `${tf.amount(entry.amount)} ${stream.ticker}`
                    : ''}
                </TdCell>
                <TdCell>
                  {entry.commission_on_withdraw
                    ? `${tf.amount(entry.commission_on_withdraw)} ${
                      stream.ticker
                    }`
                    : ''}
                </TdCell>
                <TdCell>
                  {format(
                    timestamp(Number(entry.timestamp)).fromNanosec(),
                    'yyyy MMM dd HH:mm:ss',
                  )}
                </TdCell>
              </tr>
            ))}
        </tbody>
      </table>
      <div
        className={classNames(
          'flex justify-between',
          maxPage === 0 ? 'invisible' : '',
        )}
      >
        <button
          type="button"
          className={classNames(
            'p-2 hover:bg-hover hover:border-hover border border-border rounded-xl',
            currentPage <= 0 ? 'invisible' : '',
          )}
          onClick={onPrevPageClick}
        >
          Prev Page
        </button>
        <div
          className={classNames(
            'rounded-full border-border border w-10 h-10 inline-flex items-center justify-center',
          )}
        >
          {currentPage + 1}
        </div>
        <button
          type="button"
          className={classNames(
            'p-2 hover:bg-hover hover:border-hover border border-border rounded-xl',
            currentPage >= maxPage ? 'invisible' : '',
          )}
          onClick={onNextPageClick}
        >
          Next Page
        </button>
      </div>
    </div>
  );
}