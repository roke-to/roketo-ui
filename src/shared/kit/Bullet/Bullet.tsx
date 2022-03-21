import React from 'react';
import classNames from 'classnames';

type BulletProps = {
  className: string;
};

export function Bullet({ className, ...rest }: BulletProps) {
  return (
    <div
      className={classNames(
        'inline-block w-2 h-2 flex-shrink-9 rounded-full',
        className,
      )}
      {...rest}
    />
  );
}
