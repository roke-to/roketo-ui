import React from 'react';
import {streamViewData} from '.';
import {StreamIn, StreamOut} from '../../components/icons';
import classNames from 'classnames';

export function StreamingSpeed({stream, className, ...rest}) {
  const direction = stream.direction;
  const {tf} = streamViewData(stream);

  return (
    <div
      className={classNames(
        'twind-inline-flex twind-items-center twind-whitespace-nowrap',
        className,
      )}
      {...rest}
    >
      {direction === 'out' ? <StreamOut /> : <StreamIn />}
      <span className="twind-ml-2">
        <span>@{tf.tokensPerS(stream.tokens_per_tick)}</span>
        <span> {stream.token_name} / Sec</span>
      </span>
    </div>
  );
}
