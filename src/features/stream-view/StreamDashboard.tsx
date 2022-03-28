import React from 'react';
import classNames from 'classnames';

import { ArcProgressBar } from 'shared/kit/ProgressBar';
import { Tooltip } from 'shared/kit/Tooltip';
import { streamDirection } from 'shared/api/roketo/helpers';
import type { RoketoAccount, RoketoStream } from 'shared/api/roketo/interfaces/entities';

import { StreamControls } from '../stream-control';
import { StreamWithdrawButton } from '../stream-control/StreamWithdrawButton';

import { streamViewData } from './streamViewData';
import { StreamingSpeed } from './StreamingSpeed';

type StreamDashboardProps = {
  stream: RoketoStream;
  account: RoketoAccount;
};

export function StreamDashboard({ stream, account }: StreamDashboardProps) {

  const {
    progresses,
    percentages,
    isDead,
    progress: { full, withdrawn, streamed },
  } = streamViewData(stream);
  const direction = streamDirection({ stream, account });
  console.log('log', percentages, full, withdrawn, streamed)

  return (
    <div className={classNames('flex', 'flex-col', 'items-center')}>
      <div className="-mb-32">
        <Tooltip
          align={{ offset: [0, -20] }}
          overlay={(
            <div className="text-left">
              {/* <StreamProgressPercentage
                className="whitespace-nowrap mb-2"
                label="Withdrawn"
                colorClass="bg-streams-withdrawn"
                formattedFloatValue={`${tf.amount(withdrawn)} ${stream.ticker}`}
                percentageValue={percentages.withdrawn}
              />
              <StreamProgressPercentage
                className="whitespace-nowrap"
                label="Streamed"
                colorClass="bg-streams-streamed"
                formattedFloatValue={`${tf.amount(streamed)} ${stream.ticker}`}
                percentageValue={percentages.streamed}
              /> */}
            </div>
          )}
        >
          <ArcProgressBar className="w-96 h-48" progresses={progresses} />
        </Tooltip>

        <div className="flex justify-between pt-5 -mx-2 text-gray">
          <div className="w-10 text-center"> 0%</div>
          <div className="w-10 text-center"> 100%</div>
        </div>
      </div>

      {/* <TokenImage size={14} tokenName={stream.ticker} className="mb-8" /> */}
      {/* <div className="text-6xl font-semibold">{tf.amount(streamed)}</div> */}
      <div className="text-gray font-semibold">
        of
        {' '}
        {/* {tf.amount(full)} */}
        {' '}
        {/* {stream.ticker} */}
      </div>
      <StreamingSpeed
        stream={stream}
        // direction={direction}
        className="mt-6 mb-6"
      />
      {isDead ? (
        ''
      ) : (
        <div className="flex relative z-10">
          <StreamControls stream={stream} className="mr-2" />

          {/* render withdraw funds button */}
          {direction === 'in' ? (
            <StreamWithdrawButton
              loadingText="Withdrawing..."
              variant="outlined"
              color="dark"
            >
              Withdraw from all streams
            </StreamWithdrawButton>
          ) : null}
        </div>
      )}
    </div>
  );
}
