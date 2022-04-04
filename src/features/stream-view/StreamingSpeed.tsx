import React from 'react';
import classNames from 'classnames';

import { useTokenFormatter } from 'shared/hooks/useTokenFormatter';
import { StreamOutIcon } from 'shared/icons/StreamOut';
import { StreamInIcon } from 'shared/icons/StreamIn';
import { RoketoStream } from 'shared/api/roketo/interfaces/entities';
import { useGetStreamDirection, STREAM_DIRECTION } from 'shared/hooks/useGetStreamDirection';

type StreamingSpeedProps = {
  stream: RoketoStream;
  className?: string;
}

export function StreamingSpeed({ stream, className }: StreamingSpeedProps) {
  const direction = useGetStreamDirection(stream);
  const { formatter, meta } = useTokenFormatter(stream.token_account_id);
  const speedInfo = formatter.tokensPerMeaningfulPeriod(stream.tokens_per_sec);

  return (
    <div
      className={classNames(
        'inline-flex items-center whitespace-nowrap',
        className,
      )}
    >
      {direction === STREAM_DIRECTION.OUT ? (
        <StreamOutIcon />
      ) : direction === STREAM_DIRECTION.IN ? (
        <StreamInIcon />
      ) : (
        ''
      )}
      <span className="ml-2">
        <span>
          @
          {speedInfo.formattedValue}
        </span>
        <span>
          {' '}
          {meta.symbol}
          {' '}
          /
          {speedInfo.unit}
        </span>
      </span>
    </div>
  );
}
