import React from 'react';
import {StreamIn, StreamOut} from '../../components/icons';
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
        <StreamOut />
      ) : direction === 'in' ? (
        <StreamIn />
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
