import cn from 'classnames';
import {useStoreMap} from 'effector-react';
import RCTooltip from 'rc-tooltip';
import React from 'react';

import {testIds} from '~/shared/constants';
import {ProgressBar} from '~/shared/ui/components/ProgressBar';
import clockIcon from '~/shared/ui/icons/clock.svg';

import {streamProgressDataDefaults} from '../constants';
import {$streamsProgress} from '../model';
import styles from './styles.module.scss';

const TOOLTIP_ALIGN = {
  points: ['tl', 'bc'],
  offset: [-24, 10],
};

export const StreamProgress = ({streamId, className}: {streamId: string; className: string}) => {
  const {
    progressText,
    symbol,
    sign,
    progressFull,
    progressStreamed,
    progressWithdrawn,
    cliffPercent,
    speedFormattedValue,
    speedUnit,
    timeLeft,
    streamedText,
    streamedPercentage,
    withdrawnText,
    withdrawnPercentage,
    direction,
    name,
  } = useStoreMap({
    store: $streamsProgress,
    keys: [streamId],
    fn: (items) => items[streamId],
    defaultValue: streamProgressDataDefaults,
  });
  return (
    <RCTooltip
      overlayClassName={styles.overlay}
      destroyTooltipOnHide
      align={TOOLTIP_ALIGN}
      placement="bottom"
      overlay={
        <div className={cn(styles.tooltip, styles.text)}>
          <div className={styles.innerStatus}>
            <span>{progressText}</span>{' '}
            <span className={cn(styles.grey, styles.smaller)}>{symbol}</span>
          </div>

          <ProgressBar
            total={progressFull}
            streamed={progressStreamed}
            withdrawn={progressWithdrawn}
            cliffPercent={cliffPercent}
            direction={direction}
          />

          <div className={cn(styles.status, styles.speed)}>
            {speedFormattedValue}{' '}
            <span className={cn(styles.grey, styles.smaller)}>
              {symbol} / {speedUnit}
            </span>
          </div>

          {timeLeft && (
            <div className={styles.remained}>
              <img src={clockIcon} className={styles.clock} alt="remainded" />
              {timeLeft}
            </div>
          )}

          <div className={cn(styles.progress, styles.streamed)}>
            Streamed: {streamedText}{' '}
            <span className={cn(styles.grey, styles.smaller)}>{`${streamedPercentage}%`}</span>
          </div>

          <div className={cn(styles.progress, styles.withdrawn)}>
            Withdrawn: {withdrawnText}{' '}
            <span className={cn(styles.grey, styles.smaller)}>{`${withdrawnPercentage}%`}</span>
          </div>
        </div>
      }
    >
      <div className={cn(styles.root, styles.text, className)}>
        <ProgressBar
          total={progressFull}
          streamed={progressStreamed}
          withdrawn={progressWithdrawn}
          cliffPercent={cliffPercent}
          direction={direction}
        >
          <div className={styles.status}>
            <span className={styles.streamName}>{name}</span>
            <div className={styles.progressStatus}>
              <span data-testid={testIds.streamProgressCaption}>
                {sign}
                {progressText}
              </span>{' '}
              <span className={styles.tokenSymbol}>{symbol}</span>
            </div>
          </div>
        </ProgressBar>
      </div>
    </RCTooltip>
  );
};
