import classNames from 'classnames';
import React from 'react';
import copy from 'clipboard-copy';
import { Link } from 'react-router-dom';
import { formatDuration, intervalToDuration } from 'date-fns';

import { TokenImage } from 'shared/kit/TokenImage';
import { ProgressBar } from 'shared/kit/ProgressBar';
import { Button } from 'shared/kit/Button';
import { routes } from 'shared/helpers/routing';
import { LinkIcon } from 'shared/icons/Link';
import { shortEnLocale } from 'shared/helpers/date';
import { isIdling } from 'shared/api/roketo/helpers';
import { DurationTimer } from 'shared/components/DurationTimer';
import type { RoketoStream } from 'shared/api/roketo/interfaces/entities';
import { useRoketoContext } from 'app/roketo-context';

import { StreamControls } from '../stream-control';

import { streamViewData } from './streamViewData';
import { StreamingSpeed } from './StreamingSpeed';
import { StreamProgressPercentage } from './StreamProgressPercentage';

type StreamCardProps = {
  stream: RoketoStream;
  direction: string;
  className: string;
};

export function StreamCard({ stream, direction, className }: StreamCardProps) {
  // const tf = useTokenFormatter(stream.ticker);
  const { tokens } = useRoketoContext();
  const { formatter, meta } = tokens[stream.token_account_id];

  const {
    dateEnd,
    progresses,
    timestampEnd,
    percentages,
    progress: { full, withdrawn, streamed },
    link,
  } = streamViewData(stream);

  console.log('log', percentages, full, withdrawn, streamed)

  const duration = intervalToDuration({
    start: new Date(),
    end: dateEnd,
  });
  const timeLeft = formatDuration(duration, {
    locale: shortEnLocale,
  });

  return (
    <div
      className={classNames(
        'grid grid-cols-12 gap-6 justify-items-center',
        'p-10 bg-input rounded-3xl',
        className,
      )}
    >
      <Link
        to={routes.stream(stream.id)}
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

            <StreamingSpeed stream={stream} direction={direction} />

            <div className="whitespace-nowrap">
              {isIdling(stream) ? (
                timeLeft
              ) : (
                <DurationTimer
                  untilTimestamp={timestampEnd}
                  suffix=" remaining"
                />
              )}
            </div>
          </div>
        </div>
        <ProgressBar className="mt-5" progresses={progresses} />
        <div className="flex text-sm mt-3 mr-3">
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
        {direction === 'in' ? (
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
            to={routes.stream(stream.id)}
          >
            <LinkIcon />
          </Button>
        </div>
      </div>
    </div>
  );
}
