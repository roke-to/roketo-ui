import classNames from 'classnames';
import React from 'react';
import copy from 'clipboard-copy';
import {Link} from 'react-router-dom';

import {StreamingSpeed} from './StreamingSpeed';
import {ProgressBar, Button, TokenImage} from '../../components/kit';
import {
  StreamControls,
  StreamAutodepositControls,
  StreamDepositButton,
} from '../stream-control';
import {DurationTimer} from '../../components/DurationTimer';
import {routes} from '../../lib/routing';
import {streamViewData} from './streamViewData';
import {Link as LinkIcon} from '../../components/icons';
import {StreamProgressPercentage} from './StreamProgressPercentage';
import {isIdling} from '.';
import {useTokenFormatter} from '../../lib/useTokenFormatter';
import {formatDuration, intervalToDuration} from 'date-fns';
import {shortEnLocale} from '../../lib/date';

const streamType = {
  id: '51ofCnrPfZ8WA4NWJAnGYvNM1yqDfsVQqpaoxkYz3aZE',
  description: 'qweqweqwe',
  owner_id: 'ggoshanov.testnet',
  receiver_id: 'sdf.testnet',
  ticker: 'NEAR',
  timestamp_created: '1633966709524321545',
  balance: '1990000000000000000000000',
  tokens_per_tick: '33333333333333',
  is_auto_deposit_enabled: true,
  status: 'ACTIVE',
  tokens_total_withdrawn: '0',
  available_to_withdraw: '1990000000000000000000000',
  history_len: 4,
  direction: 'out',
};

export function StreamCard({stream = streamType, direction, className}) {
  const tf = useTokenFormatter(stream.ticker);

  const {
    dateEnd,
    progresses,
    timestampEnd,
    percentages,
    progress: {full, withdrawn, streamed},
    link,
  } = streamViewData(stream, tf);

  const duration = intervalToDuration({
    start: new Date(),
    end: dateEnd,
  });
  let timeLeft = formatDuration(duration, {
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
          <TokenImage tokenName={stream.ticker} className="mr-4" />
          <div className="w-full gap-4 flex items-end flex-wrap">
            <div className="text-2xl whitespace-nowrap flex-shrink-0">
              {tf.amount(streamed)} of {tf.amount(full)}{' '}
              <span className="uppercase">{stream.ticker}</span>
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
            formattedFloatValue={tf.amount(withdrawn) + ' ' + stream.ticker}
            percentageValue={percentages.withdrawn}
          />
          <StreamProgressPercentage
            label="Streamed"
            colorClass="bg-streams-streamed"
            formattedFloatValue={tf.amount(streamed) + ' ' + stream.ticker}
            percentageValue={percentages.streamed}
          />
        </div>
      </Link>
      <div className="hidden xl:block"></div>
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
        {direction === 'out' ? (
          <div className="col-span-1 mr-4">
            <div className="text-gray">Auto&#8209;dep:</div>
            <StreamAutodepositControls minimal stream={stream} />
          </div>
        ) : null}
        <div className="flex items-start justify-end w-52">
          {direction === 'out' ? (
            <StreamDepositButton className="flex-grow" stream={stream} />
          ) : null}
          <Button
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
