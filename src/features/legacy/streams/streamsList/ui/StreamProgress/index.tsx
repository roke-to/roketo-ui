import cn from 'classnames';
import RCTooltip from 'rc-tooltip';
import React from 'react';

import {TokenFormatter} from '~/features/legacy/ft-tokens/token-formatter';

import {getRoundedPercentageRatio} from '~/shared/lib/math';
import {ProgressBar} from '~/shared/ui/components/ProgressBar';

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

function ClockIcon({className}: {className?: string}) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className={className}>
      <path
        d="M8.99169 0.666504C4.39169 0.666504 0.666687 4.39984 0.666687 8.99984C0.666687 13.5998 4.39169 17.3332 8.99169 17.3332C13.6 17.3332 17.3334 13.5998 17.3334 8.99984C17.3334 4.39984 13.6 0.666504 8.99169 0.666504ZM9.00002 15.6665C5.31669 15.6665 2.33335 12.6832 2.33335 8.99984C2.33335 5.3165 5.31669 2.33317 9.00002 2.33317C12.6834 2.33317 15.6667 5.3165 15.6667 8.99984C15.6667 12.6832 12.6834 15.6665 9.00002 15.6665ZM9.41669 4.83317H8.16669V9.83317L12.5417 12.4582L13.1667 11.4332L9.41669 9.20817V4.83317Z"
        fill="black"
      />
    </svg>
  );
}

export const StreamProgress = ({stream, className}: StreamStatusProps) => {
  const {ticker: tokenId, tokens_per_tick: tokensPerTick} = stream;

  const tokensPerSec = Number(tokensPerTick) * TICK_TO_S;

  const {progress, timeLeft} = streamViewData(stream);

  const formatter = useTokenFormatter(tokenId);

  const streamed = Number(formatter.toHumanReadableValue(progress.streamed));
  const withdrawn = Number(formatter.toHumanReadableValue(progress.withdrawn));
  const total = Number(formatter.toHumanReadableValue(progress.full));

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
