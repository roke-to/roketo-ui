import React from 'react';
import {StreamOutIcon} from '../../components/icons/StreamOut';
import {StreamInIcon} from '../../components/icons/StreamIn';
import classNames from 'classnames';
import {useTokenFormatter} from '../../lib/useTokenFormatter';

export function StreamingSpeed({stream, direction, className, ...rest}) {
  const tf = useTokenFormatter(stream.ticker);
  const speedInfo = tf.tokensPerMeaningfulPeriod(stream.tokens_per_tick);

  return (
    <div
      className={classNames(
        'inline-flex items-center whitespace-nowrap',
        className,
      )}
      {...rest}
    >
      {direction === 'out' ? (
        <StreamOutIcon />
      ) : direction === 'in' ? (
        <StreamInIcon />
      ) : (
        ''
      )}
      <span className="ml-2">
        <span>@{speedInfo.formattedValue}</span>
        <span>
          {' '}
          {stream.ticker} / {speedInfo.unit}
        </span>
      </span>
    </div>
  );
}
