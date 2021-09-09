import classNames from 'classnames';
import React from 'react';
import copy from 'clipboard-copy';
import {Link} from 'react-router-dom';

import {StreamingSpeed} from './StreamingSpeed';
import {ProgressBar, Button, TokenImage} from '../../components/kit';
import {StreamControls, StreamAutodepositControls, StreamDepositButton} from '../stream-control';
import {DurationTimer} from '../../components/DurationTimer';
import {routes} from '../../lib/routing';
import {streamViewData} from './streamViewData';
import {Link as LinkIcon} from '../../components/icons';
import numbro from 'numbro';
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

function Bullet({className, ...rest}) {
  return (
    <div
      className={classNames(
        'twind-inline-block twind-w-2 twind-h-2 twind-flex-shrink-9 twind-rounded-full',
        className,
      )}
      {...rest}
    ></div>
  );
}
export function StreamCard({stream = streamType, direction, className}) {
  const {
    dateEnd,
    progresses,
    tf,
    percentages,
    progress: {full, withdrawn, streamed},
    link,
  } = streamViewData(stream);

  return (
    <div
      className={classNames(
        'twind-grid twind-grid-cols-12 twind-gap-6 twind-justify-items-center',
        'twind-p-10 twind-bg-input twind-rounded-3xl',
        className,
      )}
    >
      <Link
        to={routes.stream(stream.stream_id)}
        className="twind-w-full twind-col-span-12 xl:twind-col-span-6 twind-justify-self-start"
      >
        <div className="twind-flex twind-items-center">
          <TokenImage tokenName={stream.token_name} className="twind-mr-4" />
          <div className="twind-w-full twind-gap-4 twind-flex twind-items-end twind-flex-wrap">
            <div className="twind-text-2xl twind-whitespace-nowrap twind-flex-shrink-0">
              {tf.amount(streamed)} of {tf.amount(full)}{' '}
              <span className="twind-uppercase">{stream.token_name}</span>
            </div>

            <StreamingSpeed stream={stream} direction={direction} />

            <div className="twind-whitespace-nowrap">
              {stream.status === STREAM_STATUS.PAUSED ? (
                ''
              ) : (
                <DurationTimer untilDate={dateEnd} suffix=" remaining" />
              )}
            </div>
          </div>
        </div>
        <ProgressBar className="twind-mt-5" progresses={progresses} />
        <div className="twind-flex twind-text-sm twind-mt-3 twind-mr-3">
          <div className="twind-mr-4">
            <Bullet className="twind-bg-streams-withdrawn twind-mr-1" />
            <span>
              Withdrawn:{' '}
              <span className="twind-font-semibold">
                {tf.amount(withdrawn)}{' '}
              </span>
              <span className="twind-text-gray">
                {' '}
                (
                {numbro(percentages.withdrawn).format({
                  output: 'percent',
                  mantissa: 1,
                })}
                )
              </span>
            </span>
          </div>
          <div>
            <Bullet className="twind-bg-streams-streamed twind-mr-1" />
            <span>
              Streamed:{' '}
              <span className="twind-font-semibold">
                {tf.amount(streamed)}{' '}
              </span>
              <span className="twind-text-gray">
                {' '}
                (
                {numbro(percentages.streamed).format({
                  output: 'percent',
                  mantissa: 1,
                })}
                )
              </span>
            </span>
          </div>
        </div>
      </Link>
      <div className="twind-hidden xl:twind-block"></div>
      <div className="twind-flex twind-gap-5 twind-justify-between xl:twind-justify-end twind-col-span-12 xl:twind-col-span-5 twind-w-full twind-items-center">
        <div className="twind-w-44">
          <div className="twind-text-gray">Receiver:</div>
          <div className="twind-break-words">{stream.receiver_id}</div>
        </div>
        <div className="twind-w-24">
          <div className="twind-text-gray">Status:</div>
          <StreamControls className="twind-w-full" minimal stream={stream} />
        </div>
      {
        direction === 'out' ?
          <div className="twind-col-span-1 twind-mr-4">
          <div className="twind-text-gray">Auto&#8209;dep:</div>
          <StreamAutodepositControls minimal stream={stream}/> 
          </div> : null
      }
        <div className="twind-flex twind-items-start twind-justify-end twind-w-52">
          {direction === 'out' ? <StreamDepositButton stream={stream} /> : null}
          <Button
            className="twind-ml-3"
            variant="filled"
            onClick={() => copy(link)}
            to={routes.stream(stream.stream_id)}
          >
            <LinkIcon />
          </Button>
        </div>
      </div>
    </div>
  );
}
