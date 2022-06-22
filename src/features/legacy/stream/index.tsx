import classNames from 'classnames';
import copy from 'clipboard-copy';
import {format, isPast} from 'date-fns';
import React, {useState} from 'react';
import {Link, useParams} from 'react-router-dom';

import {tokensPerMeaningfulPeriod} from '~/shared/api/token-formatter';
import {RichToken} from '~/shared/api/types';
import {PageError} from '~/shared/components/PageError';
import {DropdownOpener} from '~/shared/kit/DropdownOpener';
import {TokenImage} from '~/shared/kit/TokenImage';
import {getRoundedPercentageRatio} from '~/shared/lib/math';

import {Layout} from '@ui/components/Layout';
import {ProgressBar} from '@ui/components/ProgressBar';
import {LinkIcon} from '@ui/icons/Link';

import {TICK_TO_S} from '../api/roketo/config';
import {STREAM_STATUS} from '../api/roketo/constants';
import type {LegacyRoketoStream} from '../api/roketo/interfaces/entities';
import {STREAM_DIRECTION, useGetStreamDirection} from '../hooks/useGetStreamDirection';
import {useTokenFormatter} from '../hooks/useTokenFormatter';
import {useRoketoContext} from '../roketo-context';
import {streamViewData, useAccount, useLegacySingleStream} from '../roketo-resource';
import {getLegacyStreamLink, LEGACY_ROUTES_MAP} from '../routing';
import {StreamControls} from '../stream-control/StreamControls';
import {WithdrawAllButton} from '../stream-control/WithdrawAllButton';
import {BreadcrumbIcon} from './BreadcrumbIcon';
import styles from './styles.module.scss';

const getStreamingSpeed = (speedInSeconds: number | string, token: RichToken): string => {
  if (Number(speedInSeconds) <= 0) {
    return 'none';
  }

  const {meta} = token;
  const {formattedValue, unit} = tokensPerMeaningfulPeriod(meta.decimals, speedInSeconds);

  return `${formattedValue} ${meta.symbol} / ${unit}`;
};

function StreamProgress({stream}: {stream: LegacyRoketoStream}) {
  const formatter = useTokenFormatter(stream.ticker);

  const {
    progress: {streamed, withdrawn, full},
  } = streamViewData(stream);

  return (
    <div>
      <div className={styles.numericProgress}>
        <TokenImage tokenAccountId={stream.ticker} className={styles.tokenIcon} />
        <span>{`${stream.ticker} ${formatter.amount(streamed)} of ${formatter.amount(full)}`}</span>
      </div>
      <ProgressBar total={full} streamed={streamed} withdrawn={withdrawn} />
    </div>
  );
}

function StreamButtons({stream}: {stream: LegacyRoketoStream}) {
  const {isDead} = streamViewData(stream);
  const direction = useGetStreamDirection(stream);

  if (isDead) {
    return null;
  }

  return (
    <div className={styles.buttons}>
      <StreamControls stream={stream} />

      {direction === STREAM_DIRECTION.IN &&
        stream.status === STREAM_STATUS.ACTIVE &&
        stream.available_to_withdraw !== '0' && <WithdrawAllButton>Withdraw all</WithdrawAllButton>}
    </div>
  );
}

function StreamSpeed({stream}: {stream: LegacyRoketoStream}) {
  const formatter = useTokenFormatter(stream.ticker);

  return (
    <div>
      <span className={styles.blockTitle}>Speed</span>
      <div className={styles.speed}>
        {getStreamingSpeed(Number(stream.tokens_per_tick) * TICK_TO_S, {
          formatter,
          meta: {symbol: stream.ticker},
        } as unknown as RichToken)}
      </div>
    </div>
  );
}

function StreamComment({stream}: {stream: LegacyRoketoStream}) {
  let comment = '';

  try {
    const parsedDescription = JSON.parse(stream.description);
    comment = parsedDescription.comment;
  } catch {
    comment = stream.description;
  }

  if (comment === '') {
    return null;
  }

  return (
    <div>
      <span className={styles.blockTitle}>Comment</span>
      <div className={styles.commentBody}>{comment}</div>
    </div>
  );
}

function CopyButton({stringToCopy}: {stringToCopy: string}) {
  return (
    <button type="button" className={styles.copyButton} onClick={() => copy(stringToCopy)}>
      <LinkIcon className={styles.linkIcon} />
    </button>
  );
}

function StreamCopyUrlBlock({stream}: {stream: LegacyRoketoStream}) {
  const link = getLegacyStreamLink(stream.id);

  return (
    <div>
      <div className={classNames(styles.blockTitle, styles.copyTitle)}>
        Public link to view the stream
        <CopyButton stringToCopy={link} />
      </div>
      <div className={styles.link}>{link}</div>
    </div>
  );
}

function InfoRow({title, children}: {title: string; children: React.ReactNode}) {
  return (
    <div className={styles.infoRow}>
      <span className={styles.infoTitle}>{title}</span>
      {children}
    </div>
  );
}

function StreamData({stream}: {stream: LegacyRoketoStream}) {
  const direction = useGetStreamDirection(stream);
  const {tokens} = useRoketoContext();
  const {
    streamEndInfo,
    timeLeft,
    progress: {streamed, left, full},
  } = streamViewData(stream);

  const formatter = useTokenFormatter(stream.ticker);
  const {metadata: meta} = tokens.get(stream.ticker);

  const streamedToTotalPercentageRatio = getRoundedPercentageRatio(streamed, full).toNumber();
  const leftToTotalPercentageRatio = getRoundedPercentageRatio(left, full).toNumber();
  const available = Number(stream.available_to_withdraw);

  const [showOtherInfo, setShowOtherInfo] = useState(false);

  return (
    <div className={classNames(styles.tile, styles.infoTile)}>
      <div className={styles.blockHeader}>Stream info</div>
      <InfoRow title="Sender">
        <span className={styles.font16}>
          {direction === STREAM_DIRECTION.OUT ? 'You' : stream.owner_id}
        </span>
      </InfoRow>
      <InfoRow title="Receiver">
        <span className={styles.font16}>
          {direction === STREAM_DIRECTION.IN ? 'You' : stream.receiver_id}
        </span>
      </InfoRow>
      <InfoRow title="Amount">
        <span className={styles.font14}>
          {formatter.amount(full)}&nbsp;
          <span className={styles.font12}>{meta.symbol}</span>
        </span>
      </InfoRow>
      <InfoRow title="Stream Created">
        <span className={styles.font14}>
          {format(new Date(Number(stream.timestamp_created) / 1000000), "PP 'at' p")}
        </span>
      </InfoRow>
      {streamEndInfo !== null && (
        <InfoRow title={isPast(streamEndInfo) ? 'Stream Ended' : 'Stream Ends'}>
          <span className={styles.font14}>{format(new Date(streamEndInfo), "PP 'at' p")}</span>
        </InfoRow>
      )}
      <InfoRow title="Token">
        <span className={styles.font14}>
          {meta.name},&nbsp;
          <span className={styles.font12}>{meta.symbol}</span>
        </span>
      </InfoRow>

      <div className={styles.divider} />
      <DropdownOpener
        className={styles.dropdownOpener}
        opened={showOtherInfo}
        onChange={(update) => {
          setShowOtherInfo(update);
        }}
      >
        <h3 className={styles.sectionHeader}>Other info</h3>
      </DropdownOpener>

      {showOtherInfo && (
        <>
          <InfoRow title="Stream ID">
            <div className={styles.centeredFlex}>
              <span className={classNames(styles.font14, styles.streamID)}>{stream.id}</span>
              <CopyButton stringToCopy={stream.id} />
            </div>
          </InfoRow>
          <InfoRow title="Remaining">
            <span className={styles.font14}>{timeLeft || 'Finished'}</span>
          </InfoRow>
          <InfoRow title="Tokens Transferred">
            <span className={styles.font14}>
              {formatter.amount(streamed)}&nbsp;
              <span className={styles.font12}>
                {meta.symbol}{' '}
                <span className={styles.grey}>({streamedToTotalPercentageRatio}%)</span>
              </span>
            </span>
          </InfoRow>
          <InfoRow title="Tokens Left">
            <span className={styles.font14}>
              {formatter.amount(left)}&nbsp;
              <span className={styles.font12}>
                {meta.symbol} <span className={styles.grey}>({leftToTotalPercentageRatio}%)</span>
              </span>
            </span>
          </InfoRow>
          <InfoRow title="Tokens Available">
            <span className={styles.font14}>
              {formatter.amount(available)}&nbsp;
              <span className={styles.font12}>{meta.symbol}</span>
            </span>
          </InfoRow>
        </>
      )}
    </div>
  );
}

export function LegacyStreamPage() {
  const {id} = useParams() as {id: string};
  const accountSWR = useAccount();
  const streamSWR = useLegacySingleStream(id, accountSWR.data);

  const stream = streamSWR.data;
  const pageError = streamSWR.error;

  return (
    <div className={styles.root}>
      <Layout>
        <div className={styles.breadbrumbs}>
          <Link to={LEGACY_ROUTES_MAP.legacyStreams.path} className={styles.streamsLink}>
            Streams (legacy)
          </Link>
          <BreadcrumbIcon className={styles.breadbrumb} />
          <span className={styles.id}>{id}</span>
        </div>
        {pageError && (
          <PageError
            className="max-w-2xl mx-auto py-32"
            message={pageError.message}
            onRetry={() => {
              streamSWR.mutate();
            }}
          />
        )}
        {!pageError && !stream && (
          <div className="py-32 text-center text-gray text-2xl">Loading...</div>
        )}

        {!pageError && stream && (
          <main className={styles.stream}>
            <div className={styles.left}>
              <div className={classNames(styles.tile, styles.remaining)}>
                <span className={styles.blockTitle}>Remaining</span>
                <span>{streamViewData(stream).timeLeft || 'Finished'}</span>
              </div>
              <div className={classNames(styles.tile, styles.main)}>
                <StreamProgress stream={stream} />
                <StreamButtons stream={stream} />
                <StreamSpeed stream={stream} />
                <div className={styles.divider} />
                <StreamComment stream={stream} />
                <StreamCopyUrlBlock stream={stream} />
              </div>
            </div>
            <div className={styles.right}>
              <StreamData stream={stream} />
            </div>
          </main>
        )}
      </Layout>
    </div>
  );
}
