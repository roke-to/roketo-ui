import React from 'react';
import {streamViewData} from '.';
import {StreamIn, StreamOut} from '../../components/icons';
import classNames from 'classnames';

export function StreamingSpeed({stream, direction, className, ...rest}) {
  const {tf} = streamViewData(stream);

  const speedInfo = tf.tokensPerMeaningfulPeriod(stream.tokens_per_tick);

  return (
    <div
      className={classNames(
        'twind-inline-flex twind-items-center twind-whitespace-nowrap',
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
      <span className="twind-ml-2">
        <span>@{speedInfo.formattedValue}</span>
        <span>
          {' '}
          {stream.token_name} / {speedInfo.unit}
        </span>
      </span>
    </div>
  );
}
