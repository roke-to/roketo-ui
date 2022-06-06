import classNames from 'classnames';
import copy from 'clipboard-copy';
import {format, isPast} from 'date-fns';
import {useGate, useStore} from 'effector-react';
import React, {useState} from 'react';
import {Link, useParams} from 'react-router-dom';

import {AddFunds, useShouldShowAddFundsButton} from '~/features/add-funds';
import {getStreamingSpeed} from '~/features/create-stream/lib';
import {streamViewData} from '~/features/roketo-resource';
import {StreamControls} from '~/features/stream-control/StreamControls';
import {WithdrawButton} from '~/features/stream-control/WithdrawButton';

import {$tokens} from '~/entities/wallet';

import {TokenFormatter} from '~/shared/api/ft/token-formatter';
import {STREAM_STATUS} from '~/shared/api/roketo/constants';
import type {RoketoStream} from '~/shared/api/roketo/interfaces/entities';
import {getAvailableToWithdraw, isDead, isIdling} from '~/shared/api/roketo/lib';
import {Badge} from '~/shared/components/Badge';
import {PageError} from '~/shared/components/PageError';
import {STREAM_DIRECTION, useGetStreamDirection} from '~/shared/hooks/useGetStreamDirection';
import {useRerender} from '~/shared/hooks/useRerender';
import {DropdownOpener} from '~/shared/kit/DropdownOpener';
import {TokenImage} from '~/shared/kit/TokenImage';
import {getRoundedPercentageRatio} from '~/shared/lib/math';
import {getStreamLink, ROUTES_MAP} from '~/shared/lib/routing';

import {Layout} from '@ui/components/Layout';
import {ProgressBar} from '@ui/components/ProgressBar';
import {LinkIcon} from '@ui/icons/Link';

import {BreadcrumbIcon} from './BreadcrumbIcon';
import {$loading, $pageError, $stream, pageGate} from './model';
import styles from './styles.module.scss';

export function StreamPage() {
  const {id} = useParams() as {id: string};
  useGate(pageGate, id);
  const loading = useStore($loading);
  const stream = useStore($stream);
  const pageError = useStore($pageError);

  const isStreamTicking = Boolean(
    stream && !isIdling(stream) && streamViewData(stream).percentages.left > 0,
  );

  useRerender(1000, isStreamTicking);

  return (
    <div className={styles.root}>
      <Layout>
        <div className={styles.breadbrumbs}>
          <Link to={ROUTES_MAP.streams.path} className={styles.streamsLink}>
            Streams
          </Link>
          <BreadcrumbIcon className={styles.breadbrumb} />
          <span className={styles.id}>{id}</span>
        </div>
        {pageError && (
          <PageError className="max-w-2xl mx-auto py-32" message={pageError} onRetry={() => {}} />
        )}
        {loading && <div className="py-32 text-center text-gray text-2xl">Loading...</div>}

        {!pageError && stream && (
          <main className={styles.stream}>
            <div className={styles.left}>
              <div className={classNames(styles.tile, styles.remaining)}>
                <span className={styles.blockTitle}>Remaining</span>
                <span>{streamViewData(stream).timeLeft || 'Finished'}</span>
              </div>
              <div className={classNames(styles.tile, styles.main)}>
                {stream.is_locked && (
                  <Badge isOrange className={styles.closeBadge}>
                    Locked
                  </Badge>
                )}
                <StreamProgress stream={stream} />
                {!isDead(stream) && <StreamButtons stream={stream} />}
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

function StreamProgress({stream}: {stream: RoketoStream}) {
  const tokens = useStore($tokens);

  const {meta, formatter} = tokens[stream.token_account_id];
  const {progress, percentages} = streamViewData(stream);

  const streamed = Number(formatter.toHumanReadableValue(progress.streamed, 3));
  const withdrawn = Number(formatter.toHumanReadableValue(progress.withdrawn, 3));
  const streamedText = TokenFormatter.formatSmartly(streamed);
  const withdrawnText = TokenFormatter.formatSmartly(withdrawn);
  const streamedPercentage = getRoundedPercentageRatio(progress.streamed, progress.full, 1);
  const withdrawnPercentage = getRoundedPercentageRatio(progress.withdrawn, progress.streamed, 1);

  const progressText = `${meta.symbol} ${formatter.amount(progress.streamed)} of ${formatter.amount(
    progress.full,
  )}`;

  return (
    <div>
      <div className={styles.numericProgress}>
        <TokenImage tokenAccountId={stream.token_account_id} className={styles.tokenIcon} />
        <span>{progressText}</span>
      </div>
      <ProgressBar
        className={styles.progressBar}
        total={progress.full}
        streamed={progress.streamed}
        withdrawn={progress.withdrawn}
        cliffPercent={percentages.cliff}
        withBigCliffMark
      />
      <div className={styles.streamLegend}>
        <div className={classNames(styles.progress, styles.streamed)}>
          Streamed: {streamedText}{' '}
          <span
            className={classNames(styles.grey, styles.smaller)}
          >{`${streamedPercentage}%`}</span>
        </div>

        <div className={classNames(styles.progress, styles.withdrawn)}>
          Withdrawn: {withdrawnText}{' '}
          <span
            className={classNames(styles.grey, styles.smaller)}
          >{`${withdrawnPercentage}%`}</span>
        </div>
      </div>
    </div>
  );
}

function StreamButtons({stream}: {stream: RoketoStream}) {
  const shouldShowAddFundsButton = useShouldShowAddFundsButton(stream);
  const direction = useGetStreamDirection(stream);

  return (
    <div className={styles.buttons}>
      {shouldShowAddFundsButton && <AddFunds stream={stream} />}
      <StreamControls stream={stream} />

      {direction === STREAM_DIRECTION.IN && stream.status === STREAM_STATUS.Active && (
        <WithdrawButton stream={stream} />
      )}
    </div>
  );
}

function StreamSpeed({stream}: {stream: RoketoStream}) {
  const tokens = useStore($tokens);

  return (
    <div>
      <span className={styles.blockTitle}>Speed</span>
      <div className={styles.speed}>
        {getStreamingSpeed(Number(stream.tokens_per_sec), tokens[stream.token_account_id])}
      </div>
    </div>
  );
}

function StreamComment({stream}: {stream: RoketoStream}) {
  let comment: string | void;

  try {
    const parsedDescription = JSON.parse(stream.description);
    comment = parsedDescription.comment ?? parsedDescription.c;
  } catch {
    comment = stream.description;
  }

  if (!comment) {
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

function StreamCopyUrlBlock({stream}: {stream: RoketoStream}) {
  const link = getStreamLink(stream.id);

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

function StreamData({stream}: {stream: RoketoStream}) {
  const direction = useGetStreamDirection(stream);
  const tokens = useStore($tokens);
  const {
    streamEndTimestamp,
    cliffEndTimestamp,
    timeLeft,
    progress: {streamed, left, full},
  } = streamViewData(stream);
  const streamedToTotalPercentageRatio = getRoundedPercentageRatio(streamed, full).toNumber();
  const leftToTotalPercentageRatio = getRoundedPercentageRatio(left, full).toNumber();
  const available = getAvailableToWithdraw(stream).toNumber();

  const {meta, formatter} = tokens[stream.token_account_id];

  const [showOtherInfo, setShowOtherInfo] = useState(false);

  return (
    <div className={classNames(styles.tile, styles.infoTile)}>
      <div className={styles.blockHeader}>Stream info</div>
      <InfoRow title="Sender">
        <span className={classNames(styles.font16, styles.name)}>
          {direction === STREAM_DIRECTION.OUT ? 'You' : stream.owner_id}
        </span>
      </InfoRow>
      <InfoRow title="Receiver">
        <span className={classNames(styles.font16, styles.name)}>
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
      {cliffEndTimestamp && (
        <InfoRow title={isPast(cliffEndTimestamp) ? 'Cliff Period Ended' : 'Cliff Period Ends'}>
          <span className={styles.font14}>{format(cliffEndTimestamp, "PP 'at' p")}</span>
        </InfoRow>
      )}
      {streamEndTimestamp && (
        <InfoRow title={isPast(streamEndTimestamp) ? 'Stream Ended' : 'Stream Ends'}>
          <span className={styles.font14}>{format(streamEndTimestamp, "PP 'at' p")}</span>
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
          {stream.timestamp_created !== stream.last_action && (
            <InfoRow title="Latest Withdrawal">
              <span className={styles.font14}>
                {format(new Date(Number(stream.last_action) / 1000000), "PP 'at' p")}
              </span>
            </InfoRow>
          )}
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
