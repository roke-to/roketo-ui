import classNames from 'classnames';
import React from 'react';
import copy from 'clipboard-copy';
import { Link, generatePath } from 'react-router-dom';

import { TokenImage } from 'shared/kit/TokenImage';
import { ProgressBar } from 'shared/kit/ProgressBar';
import { Button } from 'shared/kit/Button';
import { getStreamLink, ROUTES_MAP } from 'shared/helpers/routing';
import { LinkIcon } from 'shared/icons/Link';
import type { RoketoStream } from 'shared/api/roketo/interfaces/entities';
import { useToken } from 'shared/hooks/useToken';
import { useGetStreamDirection, STREAM_DIRECTION } from 'shared/hooks/useGetStreamDirection';
import { StreamControls } from 'features/stream-control/StreamControls';
import {streamViewData} from 'features/roketo-resource';

import { StreamingSpeed } from './StreamingSpeed';
import { StreamProgressPercentage } from './StreamProgressPercentage';

type StreamCardProps = {
  stream: RoketoStream;
  className: string;
};

export function StreamCard({ stream, className }: StreamCardProps) {
  const { formatter, meta } = useToken(stream.token_account_id);
  const direction = useGetStreamDirection(stream);

  const {
    progresses,
    percentages,
    timeLeft,
    progress: { full, withdrawn, streamed },
  } = streamViewData(stream);

  const link = getStreamLink(stream.id);

  const streamRoutePath = ROUTES_MAP.stream.path;

  return (
    <div
      className={classNames(
        'grid grid-cols-12 gap-6 justify-items-center',
        'p-10 bg-input rounded-3xl',
        className,
      )}
    >
      <Link
        to={generatePath(streamRoutePath, { id: stream.id })}
        className="w-full col-span-12 xl:col-span-6 justify-self-start"
      >
        <div className="flex items-center">
          <TokenImage tokenAccountId={stream.token_account_id} className="mr-4" />
          <div className="w-full gap-4 flex items-end flex-wrap">
            <div className="text-2xl whitespace-nowrap flex-shrink-0">
              {formatter.amount(streamed)}
              {' '}
              of
              {' '}
              {formatter.amount(full)}
              {' '}
              <span className="uppercase">{meta.symbol}</span>
            </div>

            <StreamingSpeed stream={stream} />

            <div className="whitespace-nowrap">
              {timeLeft && `${timeLeft} remaining`}
            </div>
          </div>
        </div>
        <ProgressBar className="mt-5" progresses={progresses} />
        <div className="flex text-sm t6578mt-3 mr-3">
          <StreamProgressPercentage
            className="mr-4"
            label="Withdrawn"
            colorClass="bg-streams-withdrawn"
            formattedFloatValue={`${formatter.amount(withdrawn)} ${meta.symbol}`}
            percentageValue={percentages.withdrawn}
          />
          <StreamProgressPercentage
            label="Streamed"
            colorClass="bg-streams-streamed"
            formattedFloatValue={`${formatter.amount(streamed)} ${meta.symbol}`}
            percentageValue={percentages.streamed}
          />
        </div>
      </Link>
      <div className="hidden xl:block" />
      <div className="flex gap-5 justify-between xl:justify-end col-span-12 xl:col-span-5 w-full items-center flex-wrap md:flex-nowrap">
        {direction === STREAM_DIRECTION.IN ? (
          <div className="w-44">
            <div className="text-gray">Sender:</div>
            <div className="break-words">{stream.owner_id}</div>
          </div>
        ) : (
          <div className="w-44">
            <div className="text-gray">Receiver:</div>
            <div className="break-words">{stream.receiver_id}</div>
          </div>
        )}
        <div className="w-24">
          <div className="text-gray">Status:</div>
          <StreamControls className="w-full" minimal stream={stream} />
        </div>
        <div className="flex items-start justify-end w-52">
          <Button
            type="button"
            className="ml-3"
            variant="filled"
            onClick={() => copy(link)}
            to={generatePath(streamRoutePath, { id: stream.id })}
          >
            <LinkIcon />
          </Button>
        </div>
      </div>
    </div>
  );
}
