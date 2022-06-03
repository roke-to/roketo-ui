import React from 'react';
import cn from 'classnames';

import {getRoundedPercentageRatio} from '~/shared/helpers/math';

import styles from './styles.module.scss';

type Props = {
  total: string,
  streamed: string,
  withdrawn: string,
  cliffPercent?: number | null,
  withBigCliffMark?: boolean,

  className?: string,
};

export const ProgressBar = ({total, streamed, withdrawn, className, cliffPercent, withBigCliffMark = false}: Props) => {
  const streamedToTotalPercentageRatio = getRoundedPercentageRatio(streamed, total);
  const withdrawnToStreamedPercentageRatio = getRoundedPercentageRatio(withdrawn, streamed);

  return (
    <div className={cn(styles.progressBar, className)}>
      <div className={cn(styles.progress, styles.streamed)} style={{width: `${streamedToTotalPercentageRatio}%`}}>
        <div className={cn(styles.progress, styles.withdrawn)} style={{width: `${withdrawnToStreamedPercentageRatio}%`}} />
      </div>
      {typeof cliffPercent === 'number' &&
        <div
          title="Cliff"
          className={styles.cliffMarkContainer}
          style={{left: `${cliffPercent}%`}}
        >
          <div
            className={cn(
              styles.cliffMark,
              {
                [styles.cliffMarkBig]: withBigCliffMark,
                [styles.cliffMarkPassed]: streamedToTotalPercentageRatio.toNumber() > cliffPercent,
              },
            )}

          />
        </div>
      }
    </div>
  );
};
