import {TokenFormatter, timestamp} from '../../lib/formatting';
import {format} from 'date-fns';
import classNames from 'classnames';
import {STREAM_ACTION_TYPE} from '../stream-control/lib';

function ThCell({children, className, ...rest}) {
  return (
    <th
      className={classNames(
        'twind-text-gray twind-font-normal twind-text-left twind-p-4',
        className,
      )}
      {...rest}
    >
      {children}
    </th>
  );
}

function TdCell({children, className, ...rest}) {
  return (
    <td
      className={classNames(
        'first:twind-rounded-l-xl last:twind-rounded-r-xl twind-p-4 twind-font-normal twind-text-left twind-h-14 twind-bg-input',
        className,
      )}
      {...rest}
    >
      {children}
    </td>
  );
}

const ACTION_TYPE_COLOR = {
  [STREAM_ACTION_TYPE.INIT]: 'twind-text-special-active',
  [STREAM_ACTION_TYPE.DEPOSIT]: 'twind-text-special-active',
  [STREAM_ACTION_TYPE.START]: 'twind-text-special-active',
  [STREAM_ACTION_TYPE.WITHDRAW]: 'twind-text-special-hold',
  [STREAM_ACTION_TYPE.PAUSE]: 'twind-text-special-inactive',
  [STREAM_ACTION_TYPE.STOP]: 'twind-text-special-inactive',
};

function ActionType({actionType, className, ...rest}) {
  return (
    <span
      className={classNames(ACTION_TYPE_COLOR[actionType], className)}
      {...rest}
    >
      {actionType}
    </span>
  );
}
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
}) {
  const tf = TokenFormatter(stream.token_name);

  return (
    <div
      className={classNames('twind-border-separate Table', className)}
      {...rest}
    >
      <table className="twind-border-separate Table twind-w-full">
        <thead>
          <tr>
            <ThCell>Actor</ThCell>
            <ThCell>Action Type</ThCell>
            <ThCell>Amount</ThCell>
            <ThCell>Timestamp</ThCell>
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array(pageSize)
                .fill(null)
                .map((_, i) => {
                  return (
                    <tr className="twind-mb-2" key={i}>
                      <TdCell></TdCell>
                      <TdCell></TdCell>
                      <TdCell></TdCell>
                      <TdCell></TdCell>
                    </tr>
                  );
                })
            : history.map((entry) => (
                <tr
                  className="twind-mb-2"
                  key={entry.timestamp + entry.action_type}
                >
                  <TdCell className="twind-break-all twind-w-42">
                    {entry.actor}
                  </TdCell>
                  <TdCell>
                    <ActionType actionType={entry.action_type} />
                  </TdCell>
                  <TdCell>
                    {entry.amount
                      ? `${tf.amount(entry.amount)} ${stream.token_name}`
                      : ''}
                  </TdCell>
                  <TdCell>
                    {format(
                      timestamp(entry.timestamp).fromNanosec(),
                      'yyyy MMM dd HH:mm:ss',
                    )}
                  </TdCell>
                </tr>
              ))}
        </tbody>
      </table>
      <div
        className={classNames(
          'twind-flex twind-justify-between',
          maxPage === 0 ? 'twind-invisible' : '',
        )}
      >
        <button
          className={classNames(
            'twind-p-2 hover:twind-bg-hover hover:twind-border-hover twind-border twind-border-border twind-rounded-xl',
            currentPage <= 0 ? 'twind-invisible' : '',
          )}
          onClick={onPrevPageClick}
        >
          Prev Page
        </button>
        <div
          className={classNames(
            'twind-rounded-full twind-border-border twind-border twind-w-10 twindh-10 twind-inline-flex twind-items-center twind-justify-center',
          )}
        >
          {currentPage + 1}
        </div>
        <button
          className={classNames(
            'twind-p-2 hover:twind-bg-hover hover:twind-border-hover twind-border twind-border-border twind-rounded-xl',
            currentPage >= maxPage ? 'twind-invisible' : '',
          )}
          onClick={onNextPageClick}
        >
          Next Page
        </button>
      </div>
    </div>
  );
}
