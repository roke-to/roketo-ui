import React from 'react';
import cn from 'classnames';

import {getRoundedPercentageRatio} from 'shared/helpers/math';

import styles from './styles.module.scss';

type Props = {
  total: string,
  streamed: string,
  withdrawn: string,

  className?: string,
};

export const ProgressBar = ({total, streamed, withdrawn, className}: Props) => {
  const streamedToTotalPercentageRatio = getRoundedPercentageRatio(streamed, total);
  const withdrawnToStreamedPercentageRatio = getRoundedPercentageRatio(withdrawn, streamed);

  return (
    <div className={cn(styles.progressBar, className)}>
      <div className={cn(styles.progress, styles.streamed)} style={{width: `${streamedToTotalPercentageRatio}%`}}>
        <div className={cn(styles.progress, styles.withdrawn)} style={{width: `${withdrawnToStreamedPercentageRatio}%`}} />
      </div>
    </div>
  );
};
