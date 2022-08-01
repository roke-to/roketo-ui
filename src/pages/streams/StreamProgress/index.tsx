import cn from 'classnames';
import {useStoreMap} from 'effector-react';
import RCTooltip from 'rc-tooltip';
import React from 'react';

import {testIds} from '~/shared/constants';
import {ProgressBar} from '~/shared/ui/components/ProgressBar';
import clockIcon from '~/shared/ui/icons/clock.svg';

import {streamProgressDataDefaults} from '../constants';
import {$streamsProgress, selectStream} from '../model';
import styles from './styles.module.scss';

const TOOLTIP_ALIGN = {
  points: ['tl', 'bc'],
  offset: [-24, 10],
};

const ExtendedInfo = ({streamId, className}: {streamId: string; className?: string}) => {
  const {
    totalText,
    symbol,
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
    sign,
  } = useStoreMap({
    store: $streamsProgress,
    keys: [streamId],
    fn: (items) => items[streamId],
    defaultValue: streamProgressDataDefaults,
  });
  return (
    <div className={cn(styles.extendedInfo, styles.text, className)}>
      <div className={styles.innerStatus}>
        <span>
          {streamedText} of {totalText}
        </span>{' '}
        <span className={styles.subtext}>{symbol}</span>
      </div>

      <ProgressBar
        total={progressFull}
        streamed={progressStreamed}
        withdrawn={progressWithdrawn}
        cliffPercent={cliffPercent}
        direction={direction}
      />

      <div className={cn(styles.status, styles.speed)}>
        {sign}
        {speedFormattedValue}{' '}
        <span className={styles.subtext}>
          {symbol} / {speedUnit}
        </span>
      </div>

      {timeLeft && (
        <div className={styles.remaining}>
          <img src={clockIcon} className={styles.clock} alt="remaining" />
          {timeLeft}
        </div>
      )}

      <div className={cn(styles.progress, styles.streamed)}>
        Streamed: {streamedText} <span className={styles.subtext}>{`${streamedPercentage}%`}</span>
      </div>

      <div className={cn(styles.progress, styles.withdrawn)}>
        Withdrawn: {withdrawnText}{' '}
        <span className={styles.subtext}>{`${withdrawnPercentage}%`}</span>
      </div>
    </div>
  );
};

export const StreamProgress = ({streamId, className}: {streamId: string; className: string}) => {
  const {
    totalText,
    streamedText,
    symbol,
    sign,
    progressFull,
    progressStreamed,
    progressWithdrawn,
    cliffPercent,
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
      overlay={<ExtendedInfo streamId={streamId} className={styles.tooltip} />}
    >
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div
        className={cn(styles.root, styles.text, className)}
        onClick={() => selectStream(streamId)}
      >
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
                {streamedText} of {totalText}
              </span>{' '}
              <span className={styles.tokenSymbol}>{symbol}</span>
            </div>
          </div>
        </ProgressBar>
      </div>
    </RCTooltip>
  );
};
