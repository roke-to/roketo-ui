import React from 'react';
import classNames from 'classnames';
import { StreamOutIcon } from 'shared/icons/StreamOut';
import { StreamInIcon } from 'shared/icons/StreamIn';
import { useTokenFormatter } from 'shared/hooks/useTokenFormatter';
import { RoketoStream } from 'shared/api/roketo/interfaces/entities';

type StreamingSpeedProps = {
  stream: RoketoStream;
  direction?: RoketoStream["direction"];
  className?: string;
}

export function StreamingSpeed({ stream, direction, className }: StreamingSpeedProps) {
  const tf = useTokenFormatter(stream.ticker);
  const speedInfo = tf.tokensPerMeaningfulPeriod(Number(stream.tokens_per_tick));

  return (
    <div
      className={classNames(
        'inline-flex items-center whitespace-nowrap',
        className,
      )}
    >
      {direction === 'out' ? (
        <StreamOutIcon />
      ) : direction === 'in' ? (
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
          {stream.ticker}
          {' '}
          /
          {speedInfo.unit}
        </span>
      </span>
    </div>
  );
}
