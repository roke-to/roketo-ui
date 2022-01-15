import React from 'react';
import classNames from 'classnames';

export function Bullet({className, ...rest}) {
  return (
    <div
      className={classNames(
        'inline-block w-2 h-2 flex-shrink-9 rounded-full',
        className,
      )}
      {...rest}
    ></div>
  );
}
