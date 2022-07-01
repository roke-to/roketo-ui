import classNames from 'classnames';
import copy from 'clipboard-copy';
import {useGate, useStore, useStoreMap} from 'effector-react';
import React, {useState} from 'react';
import {Link, useParams} from 'react-router-dom';

import {AddFunds} from '~/features/add-funds';
import {StreamControls} from '~/features/stream-control/StreamControls';
import {WithdrawButton} from '~/features/stream-control/WithdrawButton';

import {Badge} from '~/shared/components/Badge';
import {PageError} from '~/shared/components/PageError';
import {ColorDot} from '~/shared/kit/ColorDot';
import {DropdownOpener} from '~/shared/kit/DropdownOpener';
import {TokenImage} from '~/shared/kit/TokenImage';
import {ROUTES_MAP} from '~/shared/lib/routing';

import {Layout} from '@ui/components/Layout';
import {ProgressBar} from '@ui/components/ProgressBar';
import {LinkIcon} from '@ui/icons/Link';

import {BreadcrumbIcon} from './BreadcrumbIcon';
import {
  $buttonsFlags,
  $color,
  $comment,
  $link,
  $loading,
  $pageError,
  $speed,
  $stream,
  $streamInfo,
  $streamProgress,
  pageGate,
} from './model';
import styles from './styles.module.scss';

export function StreamPage() {
  const {id} = useParams() as {id: string};
  useGate(pageGate, id);
  const loading = useStore($loading);
  const stream = useStore($stream);
  const pageError = useStore($pageError);
  const streamColor = useStore($color);
  const comment = useStore($comment);
  const speed = useStore($speed);
  const link = useStore($link);
  const buttonsFlags = useStore($buttonsFlags);
  const remaining = useStoreMap($streamInfo, (data) => data.remaining);

  return (
    <div className={styles.root}>
      <Layout>
        <div className={styles.breadbrumbs}>
          <Link to={ROUTES_MAP.streams.path} className={styles.streamsLink}>
            Streams
          </Link>
          <BreadcrumbIcon className={styles.breadbrumb} />
          {streamColor && <ColorDot color={streamColor} size={14} className={styles.colorDot} />}
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
                <span>{remaining}</span>
              </div>
              <div className={classNames(styles.tile, styles.main)}>
                {stream.is_locked && (
                  <Badge isOrange className={styles.closeBadge}>
                    Locked
                  </Badge>
                )}
                <StreamProgress />
                {buttonsFlags.isAlive && (
                  <div className={styles.buttons}>
                    {buttonsFlags.showAddFundsButton && <AddFunds stream={stream} />}
                    <StreamControls stream={stream} />
                    {buttonsFlags.showWithdrawButton && <WithdrawButton stream={stream} />}
                  </div>
                )}
                {speed && (
                  <div>
                    <span className={styles.blockTitle}>Speed</span>
                    <div className={styles.speed}>{speed}</div>
                  </div>
                )}
                {comment && (
                  <div>
                    <span className={styles.blockTitle}>Comment</span>
                    <div className={styles.commentBody}>{comment}</div>
                  </div>
                )}
                {link && (
                  <div>
                    <div className={classNames(styles.blockTitle, styles.copyTitle)}>
                      Public link to view the stream
                      <CopyButton stringToCopy={link} />
                    </div>
                    <div className={styles.link}>{link}</div>
                  </div>
                )}
              </div>
            </div>
            <div className={styles.right}>
              <StreamData />
            </div>
          </main>
        )}
      </Layout>
    </div>
  );
}

function StreamProgress() {
  const {
    active,
    tokenAccountId,
    progressText,
    streamedText,
    withdrawnText,
    streamedPercentage,
    withdrawnPercentage,
    cliffPercent,
    withdrawn,
    streamed,
    total,
  } = useStore($streamProgress);
  if (!active) return null;

  return (
    <div>
      <div className={styles.numericProgress}>
        <TokenImage tokenAccountId={tokenAccountId} className={styles.tokenIcon} />
        <span>{progressText}</span>
      </div>
      <ProgressBar
        className={styles.progressBar}
        total={total}
        streamed={streamed}
        withdrawn={withdrawn}
        cliffPercent={cliffPercent}
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

function CopyButton({stringToCopy}: {stringToCopy: string}) {
  return (
    <button type="button" className={styles.copyButton} onClick={() => copy(stringToCopy)}>
      <LinkIcon className={styles.linkIcon} />
    </button>
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

function StreamData() {
  const [showOtherInfo, setShowOtherInfo] = useState(false);
  const {
    active,
    sender,
    receiver,
    amount,
    tokenSymbol,
    tokenName,
    streamId,
    created,
    cliff,
    end,
    remaining,
    transferred,
    streamedToTotalPercentageRatio,
    showLatestWithdrawal,
    latestWithdrawal,
    tokensLeft,
    leftToTotalPercentageRatio,
    tokensAvailable,
  } = useStore($streamInfo);
  if (!active) return null;
  return (
    <div className={classNames(styles.tile, styles.infoTile)}>
      <div className={styles.blockHeader}>Stream info</div>
      <InfoRow title="Sender">
        <span className={classNames(styles.font16, styles.name)}>{sender}</span>
      </InfoRow>
      <InfoRow title="Receiver">
        <span className={classNames(styles.font16, styles.name)}>{receiver}</span>
      </InfoRow>
      <InfoRow title="Amount">
        <span className={styles.font14}>
          {amount}&nbsp;<span className={styles.font12}>{tokenSymbol}</span>
        </span>
      </InfoRow>
      <InfoRow title="Stream Created">
        <span className={styles.font14}>{created}</span>
      </InfoRow>
      {cliff && (
        <InfoRow title={cliff.title}>
          <span className={styles.font14}>{cliff.value}</span>
        </InfoRow>
      )}
      {end && (
        <InfoRow title={end.title}>
          <span className={styles.font14}>{end.value}</span>
        </InfoRow>
      )}
      <InfoRow title="Token">
        <span className={styles.font14}>
          {tokenName},&nbsp;<span className={styles.font12}>{tokenSymbol}</span>
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
              <span className={classNames(styles.font14, styles.streamID)}>{streamId}</span>
              <CopyButton stringToCopy={streamId} />
            </div>
          </InfoRow>
          <InfoRow title="Remaining">
            <span className={styles.font14}>{remaining}</span>
          </InfoRow>
          <InfoRow title="Tokens Transferred">
            <span className={styles.font14}>
              {transferred}&nbsp;
              <span className={styles.font12}>
                {tokenSymbol}{' '}
                <span className={styles.grey}>({streamedToTotalPercentageRatio}%)</span>
              </span>
            </span>
          </InfoRow>
          {showLatestWithdrawal && (
            <InfoRow title="Latest Withdrawal">
              <span className={styles.font14}>{latestWithdrawal}</span>
            </InfoRow>
          )}
          <InfoRow title="Tokens Left">
            <span className={styles.font14}>
              {tokensLeft}&nbsp;
              <span className={styles.font12}>
                {tokenSymbol} <span className={styles.grey}>({leftToTotalPercentageRatio}%)</span>
              </span>
            </span>
          </InfoRow>
          <InfoRow title="Tokens Available">
            <span className={styles.font14}>
              {tokensAvailable}&nbsp;
              <span className={styles.font12}>{tokenSymbol}</span>
            </span>
          </InfoRow>
        </>
      )}
    </div>
  );
}
