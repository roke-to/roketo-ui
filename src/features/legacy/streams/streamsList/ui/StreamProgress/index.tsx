import cn from 'classnames';
import RCTooltip from 'rc-tooltip';
import React from 'react';

import {TokenFormatter} from '~/shared/api/ft/token-formatter';
import {getRoundedPercentageRatio} from '~/shared/lib/math';
import {ProgressBar} from '~/shared/ui/components/ProgressBar';
import {ClockIcon} from '~/shared/ui/icons/Clock';

import {TICK_TO_S} from '../../../../api/roketo/config';
import {LegacyRoketoStream} from '../../../../api/roketo/interfaces/entities';
import {useTokenFormatter} from '../../../../hooks/useTokenFormatter';
import {streamViewData} from '../../../../roketo-resource';
import styles from './styles.module.scss';

const TOOLTIP_ALIGN = {
  points: ['tl', 'bc'],
  offset: [-24, 10],
};

type StreamStatusProps = {
  stream: LegacyRoketoStream;
  className?: string;
};

export const StreamProgress = ({stream, className}: StreamStatusProps) => {
  const {ticker: tokenId, tokens_per_tick: tokensPerTick} = stream;

  const tokensPerSec = Number(tokensPerTick) * TICK_TO_S;

  const {progress, timeLeft} = streamViewData(stream);

  const formatter = useTokenFormatter(tokenId);

  const streamed = Number(formatter.amount(progress.streamed));
  const withdrawn = Number(formatter.amount(progress.withdrawn));
  const total = Number(formatter.amount(progress.full));

  const streamedText = TokenFormatter.formatSmartly(streamed);
  const withdrawnText = TokenFormatter.formatSmartly(withdrawn);

  const streamedPercentage = getRoundedPercentageRatio(streamed, total, 1);
  const withdrawnPercentage = getRoundedPercentageRatio(withdrawn, streamed, 1);

  const progressText = `${streamedText} of ${total}`;

  const {formattedValue: speedFormattedValue, unit: speedUnit} =
    formatter.tokensPerMeaningfulPeriod(tokensPerSec);

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
            <span className={cn(styles.grey, styles.smaller)}>{tokenId}</span>
          </div>

          <ProgressBar
            total={progress.full}
            streamed={progress.streamed}
            withdrawn={progress.withdrawn}
          />

          <div className={cn(styles.status, styles.speed)}>
            {speedFormattedValue}{' '}
            <span className={cn(styles.grey, styles.smaller)}>
              {tokenId} / {speedUnit}
            </span>
          </div>

          {timeLeft && (
            <div className={styles.remained}>
              <ClockIcon className={styles.clock} />
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
        <div className={styles.status}>
          <span>{progressText}</span> <span className={styles.grey}>{tokenId}</span>
        </div>

        <ProgressBar
          total={progress.full}
          streamed={progress.streamed}
          withdrawn={progress.withdrawn}
        />
      </div>
    </RCTooltip>
  );
};
