import cn from 'classnames';
import {useStoreMap} from 'effector-react';
import React, {memo} from 'react';

import {testIds} from '~/shared/constants';
import {getRoundedPercentageRatio} from '~/shared/lib/math';

import {subscriptionProgressDataDefaults} from '../constants';
import {$subscriptionsProgress} from '../model';
import styles from './styles.module.scss';

type Props = {
  total: string;
  streamed: string;
  children?: React.ReactNode;
  className?: string;
};

const ProgressBar = memo(({total, streamed, className, children}: Props) => {
  const streamedToTotalPercentageRatio = getRoundedPercentageRatio(streamed, total);
  return (
    <div
      className={cn(styles.progressBar, className)}
      style={{'--streamed-percents': streamedToTotalPercentageRatio.toString()} as any}
    >
      <div className={styles.barCut}>
        <div className={cn(styles.progress, styles.streamed)} />
        <div className={cn(styles.progress, styles.withdrawn)} />
        {children}
      </div>
    </div>
  );
});

export const SubscriptionProgress = ({
  streamId,
  className,
}: {
  streamId: string;
  className: string;
}) => {
  const {totalText, streamedText, symbol, progressFull, progressStreamed} = useStoreMap({
    store: $subscriptionsProgress,
    keys: [streamId],
    fn: (items) => items[streamId],
    defaultValue: subscriptionProgressDataDefaults,
  });
  return (
    <div className={className}>
      <ProgressBar total={progressFull} streamed={progressStreamed} className={styles.progressBar}>
        <div className={styles.status}>
          <div className={styles.progressStatus}>
            <span data-testid={testIds.streamProgressCaption}>
              {streamedText} of {totalText}
            </span>{' '}
            <span className={styles.tokenSymbol}>{symbol}</span>
          </div>
        </div>
      </ProgressBar>
    </div>
  );
};
