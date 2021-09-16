import React from 'react';
import classNames from 'classnames';

export function Bullet({className, ...rest}) {
  return (
    <div
      className={classNames(
        'twind-inline-block twind-w-2 twind-h-2 twind-flex-shrink-9 twind-rounded-full',
        className,
      )}
      {...rest}
    ></div>
  );
}
