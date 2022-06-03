import cn from 'classnames';
import RCTooltip from 'rc-tooltip';
import React from 'react';

import {streamViewData} from '~/features/roketo-resource';
import {TokenFormatter} from '~/shared/api/ft/token-formatter';
import {RoketoStream} from '~/shared/api/roketo/interfaces/entities';
import {testIds} from '~/shared/constants';
import {useToken} from '~/shared/hooks/useToken';
import {getRoundedPercentageRatio} from '~/shared/lib/math';
import {ProgressBar} from '~/shared/ui/components/ProgressBar';
import {ClockIcon} from '~/shared/ui/icons/Clock';

import styles from './styles.module.scss';

const TOOLTIP_ALIGN = {
  points: ['tl', 'bc'],
  offset: [-24, 10],
};

type StreamStatusProps = {
  stream: RoketoStream;
  className?: string;
};

export const StreamProgress = ({stream, className}: StreamStatusProps) => {
  const {token_account_id: tokenId, tokens_per_sec: tokensPerSec} = stream;

  const {progress, timeLeft, percentages} = streamViewData(stream);

  const {
    formatter,
    meta: {symbol},
  } = useToken(tokenId);

  const streamed = Number(formatter.toHumanReadableValue(progress.streamed, 3));
  const withdrawn = Number(formatter.toHumanReadableValue(progress.withdrawn, 3));
  const total = Number(formatter.toHumanReadableValue(progress.full, 3));

  const streamedText = TokenFormatter.formatSmartly(streamed);
  const withdrawnText = TokenFormatter.formatSmartly(withdrawn);

  const streamedPercentage = getRoundedPercentageRatio(progress.streamed, progress.full, 1);
  const withdrawnPercentage = getRoundedPercentageRatio(progress.withdrawn, progress.streamed, 1);

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
            <span className={cn(styles.grey, styles.smaller)}>{symbol}</span>
          </div>

          <ProgressBar
            total={progress.full}
            streamed={progress.streamed}
            withdrawn={progress.withdrawn}
            cliffPercent={percentages.cliff}
          />

          <div className={cn(styles.status, styles.speed)}>
            {speedFormattedValue}{' '}
            <span className={cn(styles.grey, styles.smaller)}>
              {symbol} / {speedUnit}
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
          <span data-testid={testIds.streamProgressCaption}>{progressText}</span>{' '}
          <span className={styles.grey}>{symbol}</span>
        </div>

        <ProgressBar
          total={progress.full}
          streamed={progress.streamed}
          withdrawn={progress.withdrawn}
          cliffPercent={percentages.cliff}
        />
      </div>
    </RCTooltip>
  );
};
