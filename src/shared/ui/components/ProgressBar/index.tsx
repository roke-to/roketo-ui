import cn from 'classnames';
import React, {memo} from 'react';

import type {StreamDirection} from '~/shared/api/roketo/constants';
import {getRoundedPercentageRatio} from '~/shared/lib/math';

import styles from './styles.module.scss';

type Props = {
  total: string;
  streamed: string;
  withdrawn: string;
  cliffPercent?: number | null;
  withBigCliffMark?: boolean;
  direction?: StreamDirection | null;
  children?: React.ReactNode;

  className?: string;
};

export const ProgressBar = memo(
  ({
    total,
    streamed,
    withdrawn,
    className,
    cliffPercent,
    withBigCliffMark = false,
    direction,
    children,
  }: Props) => {
    const streamedToTotalPercentageRatio = getRoundedPercentageRatio(streamed, total);
    const withdrawnToTotalPercentageRatio = getRoundedPercentageRatio(withdrawn, total);

    return (
      <div className={cn(styles.progressBar, className)} data-direction={direction}>
        <div
          className={cn(styles.progress, styles.streamed)}
          style={{width: `${streamedToTotalPercentageRatio}%`}}
        />
        <div
          className={cn(styles.progress, styles.withdrawn)}
          style={{width: `${withdrawnToTotalPercentageRatio}%`}}
        />
        {typeof cliffPercent === 'number' && (
          <div
            title="Cliff"
            className={styles.cliffMarkContainer}
            style={{left: `${Math.min(cliffPercent, 100)}%`}}
          >
            <div
              className={cn(styles.cliffMark, {
                [styles.cliffMarkBig]: withBigCliffMark,
                [styles.cliffMarkPassed]:
                  streamedToTotalPercentageRatio.isGreaterThan(cliffPercent),
              })}
            />
          </div>
        )}
        {children}
      </div>
    );
  },
);
