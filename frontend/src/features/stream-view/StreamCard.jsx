import classNames from 'classnames';
import React from 'react';
import {StreamingSpeed} from './StreamingSpeed';
import {ProgressBar, Button, TokenImage} from '../../components/kit';
import {StreamControls, StreamAutodepositControls, StreamDepositButton} from '../stream-control';
import {DurationTimer} from '../../components/DurationTimer';
import {routes} from '../../lib/routing';
import {streamViewData} from './streamViewData';

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
  const {
    dateEnd,
    progresses,
    tf,
    progress: {full, withdrawn, streamed},
  } = streamViewData(stream);

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
          <TokenImage tokenName={stream.token_name} className="twind-mr-4" />
          <div className="twind-w-full twind-gap-4 twind-flex twind-items-end">
            <div className="twind-text-2xl twind-whitespace-nowrap twind-flex-shrink-0">
              {tf.amount(streamed)} of {tf.amount(full)}{' '}
              <span className="twind-uppercase">{stream.token_name}</span>
            </div>

            <StreamingSpeed stream={stream} />

            <div className="twind-whitespace-nowrap">
              <DurationTimer untilDate={dateEnd} suffix=" remaining" />
            </div>
          </div>
        </div>
        <ProgressBar className="twind-mt-5" progresses={progresses} />
      </div>
      <div className="twind-col-span-2">
        <div className="twind-text-gray">Receiver:</div>
        <div>{stream.receiver_id}</div>
      </div>
      <div className="twind-col-span-1">
        <div className="twind-text-gray">Status:</div>
        <StreamControls minimal stream={stream} />
      </div>

      {direction === 'out' ?
      <div className="twind-col-span-1 twind-mr-4">
        <div className="twind-text-gray">Auto&#8209;dep:</div>

         <StreamAutodepositControls minimal stream={stream}/> 
      </div> : null}
          
      <div className="twind-col-span-2 twind-flex twind-items-start">
        {direction === 'out' ? <StreamDepositButton stream={stream} /> : null}
        <Button
          className="twind-ml-2"
          variant="filled"
          link
          to={routes.stream(stream.stream_id)}
        >
          Inspect
        </Button>
      </div>
    </div>
  );
}
