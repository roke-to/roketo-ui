import React from 'react';
import classNames from 'classnames';

import { ArcProgressBar } from 'shared/kit/ProgressBar';
import { Tooltip } from 'shared/kit/Tooltip';
import type { RoketoStream } from 'shared/api/roketo/interfaces/entities';
import { useToken } from 'shared/hooks/useToken';
import { TokenImage } from 'shared/kit/TokenImage';

import {streamViewData} from 'features/roketo-resource';

import { StreamProgressPercentage } from './StreamProgressPercentage';

export function StreamDashboard({ stream }: { stream: RoketoStream }) {
  const { token_account_id: tokenAccountId } = stream;
  const { formatter, meta } = useToken(tokenAccountId);

  const {
    progresses,
    percentages,
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
          <ArcProgressBar className="w-96 h-72" progresses={progresses} />
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
    </div>
  );
}
