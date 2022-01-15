import React from 'react';
import classNames from 'classnames';

import {TokenImage, ArcProgressBar, Tooltip} from '../../components/kit';
import {streamViewData, StreamingSpeed, streamDirection} from '.';
import {
  StreamControls,
  StreamAutodepositControls,
  StreamDepositButtonOutlined,
} from '../stream-control';
import {StreamWithdrawButton} from '../stream-control/StreamWithdrawButton';
import {StreamProgressPercentage} from './StreamProgressPercentage';
import {useTokenFormatter} from '../../lib/useTokenFormatter';

export function StreamDashboard({stream, account}) {
  const tf = useTokenFormatter(stream.ticker);

  const {
    progresses,
    percentages,
    isDead,
    progress: {full, withdrawn, streamed},
  } = streamViewData(stream, tf);
  const direction = streamDirection({stream, account});

  return (
    <div className={classNames('flex', 'flex-col', 'items-center')}>
      <div className="-mb-32">
        <Tooltip
          align={{offset: [0, -20]}}
          offset={{top: 20}}
          overlay={
            <div className="text-left">
              <StreamProgressPercentage
                className="whitespace-nowrap mb-2"
                label="Withdrawn"
                colorClass="bg-streams-withdrawn"
                formattedFloatValue={tf.amount(withdrawn) + ' ' + stream.ticker}
                percentageValue={percentages.withdrawn}
              />
              <StreamProgressPercentage
                className="whitespace-nowrap"
                label="Streamed"
                colorClass="bg-streams-streamed"
                formattedFloatValue={tf.amount(streamed) + ' ' + stream.ticker}
                percentageValue={percentages.streamed}
              />
            </div>
          }
        >
          <ArcProgressBar className="w-96 h-48" progresses={progresses} />
        </Tooltip>

        <div className="flex justify-between pt-5 -mx-2 text-gray">
          <div className="w-10 text-center"> 0%</div>
          <div className="w-10 text-center"> 100%</div>
        </div>
      </div>

      <TokenImage size={14} tokenName={stream.ticker} className="mb-8" />
      <div className="text-6xl font-semibold">{tf.amount(streamed)}</div>
      <div className="text-gray font-semibold">
        of {tf.amount(full)} {stream.ticker}
      </div>
      <StreamingSpeed
        stream={stream}
        direction={direction}
        className="mt-6 mb-6"
      />
      {isDead ? (
        ''
      ) : (
        <>
          <div className="flex relative z-10">
            <StreamControls stream={stream} className="mr-2" />

            {/* render withdraw of add funds button */}
            {direction === 'out' ? (
              <StreamDepositButtonOutlined variant="outlined" stream={stream} />
            ) : direction === 'in' ? (
              <StreamWithdrawButton
                loadingText="Withdrawing..."
                variant="outlined"
                color="dark"
              >
                Withdraw from all streams
              </StreamWithdrawButton>
            ) : null}
          </div>
          {direction === 'out' ? (
            <StreamAutodepositControls
              stream={stream}
              enableMsg="Enable auto-deposit"
              disableMsg="Disable auto-deposit"
              className="mt-4 w-72"
            />
          ) : null}
        </>
      )}
    </div>
  );
}
