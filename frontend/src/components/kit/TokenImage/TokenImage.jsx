import React from 'react';
import {Tokens} from '../../icons/Tokens';
import classNames from 'classnames';
export function TokenImage({tokenName, size = 8, className, ...rest}) {
  return (
    <div
      className={classNames(
        'twind-p-1 twind-flex-shrink-0 twind-rounded-lg twind-bg-card2 twind-inline-flex twind-items-center twind-justify-center',
        `twind-w-${size} twind-h-${size}`,
        className,
      )}
      {...rest}
    >
      <Tokens className="twind-w-full twind-h-full" tokenName={tokenName} />
    </div>
  );
}
