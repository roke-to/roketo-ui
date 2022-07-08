import cx from 'classnames';
import React from 'react';

import styles from './styles.module.scss';

export function ColorDot({
  color,
  size,
  className,
}: {
  color?: string | null;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={cx(styles.colorDot, className)}
      style={{'--color': color, '--size': size} as any}
    />
  );
}
