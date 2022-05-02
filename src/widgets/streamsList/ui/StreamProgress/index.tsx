import React from 'react';
import classNames from 'classnames';
import RCTooltip from 'rc-tooltip';

import {ProgressBar} from 'shared/ui/components/ProgressBar';
import {TokenFormatter} from 'shared/api/ft/token-formatter';
import { ClockIcon } from 'shared/icons/Clock';
import { useToken } from 'shared/hooks/useToken';
import { streamViewData } from 'features/roketo-resource';
import { RoketoStream } from 'shared/api/roketo/interfaces/entities';

import styles from './styles.module.scss';

const TOOLTIP_ALIGN = {
  points: ['tl', 'bc'],
  offset: [-24, 10],
};

type StreamStatusProps = {
  stream: RoketoStream;
};

export const StreamProgress = ({ stream }: StreamStatusProps) => {
  const { token_account_id: tokenId, tokens_per_sec: tokensPerSec } = stream;

  const { progress, timeLeft } = streamViewData(stream);

  const { formatter, meta: { symbol } } = useToken(tokenId);

  const streamed = Number(formatter.toHumanReadableValue(progress.streamed, 3));
  const withdrawn = Number(formatter.toHumanReadableValue(progress.withdrawn, 3));
  const total = Number(formatter.toHumanReadableValue(progress.full, 3));

  const streamedText = TokenFormatter.formatSmartly(streamed);

  const streamedPercentage = `${(streamed / total * 100).toFixed(1)}%`;

  const progressText = `${streamedText} of ${total}`;

  const { formattedValue: speedFormattedValue, unit: speedUnit } = formatter.tokensPerMeaningfulPeriod(tokensPerSec);

  return (
    <RCTooltip
      overlayClassName={styles.overlay}
      destroyTooltipOnHide
      align={TOOLTIP_ALIGN}
      placement="bottom"
      overlay={
        <div className={classNames(styles.tooltip, styles.text)}>
          <div className={styles.innerStatus}>
            {progressText}{' '}
            <span className={classNames(styles.grey, styles.smaller)}>{symbol}</span>
          </div>

          <ProgressBar
            total={total}
            streamed={streamed}
            withdrawn={withdrawn}
          />

          <div className={classNames(styles.status, styles.speed)}>
            {speedFormattedValue}{' '}
            <span className={classNames(styles.grey, styles.smaller)}>{symbol} / {speedUnit}</span>
          </div>
          {timeLeft && (
            <div className={styles.remained}>
              <ClockIcon className={styles.clock}/>
              {timeLeft}
            </div>
          )}
          <div className={styles.streamed}>
            Streamed: {streamedText}{' '}
            <span className={classNames(styles.grey, styles.smaller)}>
               ({streamedPercentage})
            </span>
          </div>
        </div>
      }
    >
      <div className={classNames(styles.root, styles.text)}>
        <div className={styles.status}>
          {progressText}
          <span className={styles.grey}>{symbol}</span>
        </div>

        <ProgressBar
          total={total}
          streamed={streamed}
          withdrawn={withdrawn}
        />
      </div>
    </RCTooltip>
  );
}
