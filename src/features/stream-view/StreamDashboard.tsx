import React from 'react';
import classNames from 'classnames';

import { ArcProgressBar } from 'shared/kit/ProgressBar';
import { Tooltip } from 'shared/kit/Tooltip';
import { useGetStreamDirection, STREAM_DIRECTION } from 'shared/hooks/useGetStreamDirection';
import type { RoketoStream } from 'shared/api/roketo/interfaces/entities';
import { useTokenFormatter } from 'shared/hooks/useTokenFormatter';
import { TokenImage } from 'shared/kit/TokenImage';

import { StreamControls } from '../stream-control';
import { StreamWithdrawButton } from '../stream-control/StreamWithdrawButton';

import { streamViewData } from './streamViewData';
import { StreamingSpeed } from './StreamingSpeed';
import { StreamProgressPercentage } from './StreamProgressPercentage';

export function StreamDashboard({ stream }: { stream: RoketoStream }) {
  const { token_account_id: tokenAccountId } = stream;
  const { formatter, meta } = useTokenFormatter(tokenAccountId);
  const direction = useGetStreamDirection(stream);

  const {
    progresses,
    percentages,
    isDead,
    progress: { full, withdrawn, streamed },
  } = streamViewData(stream);


  return (
    <div className={classNames('flex', 'flex-col', 'items-center')}>
      <div className="-mb-32">
        <Tooltip
          align={{ offset: [0, -20] }}
          overlay={(
            <div className="text-left">
              <StreamProgressPercentage
                className="whitespace-nowrap mb-2"
                label="Withdrawn"
                colorClass="bg-streams-withdrawn"
                formattedFloatValue={`${formatter.amount(withdrawn)} ${meta.symbol}`}
                percentageValue={percentages.withdrawn}
              />
              <StreamProgressPercentage
                className="whitespace-nowrap"
                label="Streamed"
                colorClass="bg-streams-streamed"
                formattedFloatValue={`${formatter.amount(streamed)} ${meta.symbol}`}
                percentageValue={percentages.streamed}
              />
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

      <TokenImage size={14} tokenAccountId={tokenAccountId} className="mb-8" />
      <div className="text-6xl font-semibold">{formatter.amount(streamed)}</div>
      <div className="text-gray font-semibold">
        of
        {' '}
        {formatter.amount(full)}
        {' '}
        {meta.symbol}
      </div>
      <StreamingSpeed
        stream={stream}
        className="mt-6 mb-6"
      />
      {isDead ? (
        ''
      ) : (
        <div className="flex relative z-10">
          <StreamControls stream={stream} className="mr-2" />

          {/* render withdraw funds button */}
          {direction === STREAM_DIRECTION.IN ? (
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
