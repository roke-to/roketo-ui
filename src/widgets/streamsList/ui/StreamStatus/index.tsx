import React from 'react';
import cn from 'classnames';

import {ProgressBar} from '@app/shared/ui/components/ProgressBar';
import {TokenFormatter} from '@app/shared/api/ft/token-formatter';

import styles from './styles.module.scss';

type Props = {
  total: number, // human-readable value
  streamed: number, // human-readable value
  withdrawn: number, // human-readable value
  symbol: string,
  className?: string,
}

export const StreamStatus = (props: Props) => {
  const {
    total,
    symbol,
    streamed,
    className,
    withdrawn,
  } = props;

  const displayingStreamValue = TokenFormatter.formatSmartly(streamed);

  const progress = `${displayingStreamValue} of ${total} `;

  return (
    <div className={cn(styles.root, className)}>
      <div className={styles.status}>
        {progress}
        <span className={styles.symbol}>{symbol}</span>
      </div>

      <ProgressBar
        total={total}
        streamed={streamed}
        withdrawn={withdrawn}
        className={styles.progressBar}
      />
    </div>
  );
}
