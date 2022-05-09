import React from 'react';
import { useParams, Link } from 'react-router-dom';
import copy from 'clipboard-copy';
import classNames from 'classnames';
import { format } from 'date-fns';

import { streamViewData, useSingleStream } from 'features/roketo-resource';
import { LinkIcon } from '@ui/icons/Link';
import { getStreamLink, ROUTES_MAP } from 'shared/helpers/routing';
import { PageError } from 'shared/components/PageError';
import { Layout } from '@ui/components/Layout';
import { Button, DisplayMode as ButtonDisplayMode } from '@ui/components/Button';
import type { RoketoStream } from 'shared/api/roketo/interfaces/entities';
import { getStreamingSpeed } from 'features/create-stream/lib';
import { useRoketoContext } from 'app/roketo-context';
import { ProgressBar } from '@ui/components/ProgressBar';
import { StreamControls } from 'features/stream-control/StreamControls';
import { STREAM_DIRECTION, useGetStreamDirection } from 'shared/hooks/useGetStreamDirection';
import { STREAM_STATUS } from 'shared/api/roketo/constants';
import { WithdrawButton } from 'features/stream-control/WithdrawButton';
import { TokenImage } from 'shared/kit/TokenImage';
import { getRoundedPercentageRatio } from 'shared/helpers/math';
import { getAvailableToWithdraw } from 'shared/api/roketo/helpers';

import styles from './styles.module.scss';
import { BreadcrumbIcon } from './BreadcrumbIcon';

function StreamProgress({ stream }: { stream: RoketoStream }) {
  const { tokens } = useRoketoContext();

  const { meta, formatter } = tokens[stream.token_account_id];
  const { progress: { streamed, withdrawn, full } } = streamViewData(stream);

  return (
    <div>
      <div className={styles.numericProgress}>
        <TokenImage
          tokenAccountId={stream.token_account_id}
          className={styles.tokenIcon}
        />
        <span>{`${meta.symbol} ${formatter.amount(streamed)} of ${formatter.amount(full)}`}</span>
      </div>
      <ProgressBar
        total={Number(full)}
        streamed={Number(streamed)}
        withdrawn={Number(withdrawn)}
      />
    </div>
  );
}

function StreamButtons({ stream }: { stream: RoketoStream }) {
  const { isDead } = streamViewData(stream);
  const direction = useGetStreamDirection(stream);

  if (isDead) {
    return null;
  }

  return (
    <div className={styles.buttons}>
      <StreamControls stream={stream} />

      {direction === STREAM_DIRECTION.IN && stream.status === STREAM_STATUS.Active &&
        <WithdrawButton stream={stream} />
      }
    </div>
  );
}

function StreamSpeed({ stream }: { stream: RoketoStream }) {
  const { tokens } = useRoketoContext();

  return (
    <div>
      <span className={styles.blockTitle}>Speed</span>
      <div className={styles.speed}>
        {getStreamingSpeed(Number(stream.tokens_per_sec), tokens[stream.token_account_id])}
      </div>
    </div>
  );
}

function StreamComment({ stream }: { stream: RoketoStream }) {
  if (!stream.description) {
    return null;
  }

  return (
    <div>
      <span className={styles.blockTitle}>Comment</span>
      <div className={styles.commentBody}>
        {stream.description}
      </div>
    </div>
  );
}

function CopyButton({ stringToCopy }: { stringToCopy: string }) {
  return (
    <button
      type="button"
      className={styles.copyButton}
      onClick={() => copy(stringToCopy)}
    >
      <LinkIcon className={styles.linkIcon} />
    </button>
  );
}

function StreamCopyUrlBlock({ stream }: { stream: RoketoStream }) {
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

function InfoRow({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className={styles.infoRow}>
      <span className={styles.infoTitle}>{title}</span>
      {children}
    </div>
  );
}



function StreamData({ stream }: { stream: RoketoStream }) {
  const direction = useGetStreamDirection(stream);
  const { tokens } = useRoketoContext();
  const { progress: { streamed, left, full } } = streamViewData(stream);

  const streamedToTotalPercentageRatio = getRoundedPercentageRatio(streamed, full).toNumber();
  const leftToTotalPercentageRatio = getRoundedPercentageRatio(left, full).toNumber();
  const available = getAvailableToWithdraw(stream).toNumber();

  const { meta, formatter } = tokens[stream.token_account_id];

  return (
    <div className={classNames(styles.tile, styles.infoTile)}>
      <div className={styles.bigHeader}>
        Stream info
      </div>
      {direction !== STREAM_DIRECTION.IN &&
        <InfoRow title="Receiver">
          <span className={styles.font16}>
            {stream.receiver_id}
          </span>
        </InfoRow>
      }
      {direction !== STREAM_DIRECTION.OUT &&
        <InfoRow title="Sender">
          <span className={styles.font16}>
            {stream.owner_id}
          </span>
        </InfoRow>
      }
      <div className={styles.divider} />
      <InfoRow title="Total">
          <span className={styles.font14}>
            {formatter.amount(full)}
            <span className={styles.font12}> {meta.symbol}</span>
          </span>
      </InfoRow>
      <InfoRow title="Token">
          <span className={styles.font14}>
            {meta.name},
            <span className={styles.font12}> {meta.symbol}</span>
          </span>
      </InfoRow>
      <InfoRow title="Tokens Transferred">
          <span className={styles.font14}>
            {formatter.amount(streamed)}
            <span className={styles.font12}> {meta.symbol} <span className={styles.grey}>({streamedToTotalPercentageRatio}%)</span></span>
          </span>
      </InfoRow>
      <InfoRow title="Tokens Left">
          <span className={styles.font14}>
            {formatter.amount(left)}
            <span className={styles.font12}> {meta.symbol} <span className={styles.grey}>({leftToTotalPercentageRatio}%)</span></span>
          </span>
      </InfoRow>
      <InfoRow title="Tokens Available">
          <span className={styles.font14}>
            {formatter.amount(available)}
            <span className={styles.font12}> {meta.symbol}</span>
          </span>
      </InfoRow>
    </div>
  );
}

function OtherInfo({ stream }: { stream: RoketoStream }) {
  const { timeLeft } = streamViewData(stream);

  return (
    <div className={classNames(styles.tile, styles.infoTile)}>
      <div className={styles.bigHeader}>
        Other info
      </div>
      <InfoRow title="Stream ID">
        <span className={classNames(styles.font14, styles.centeredFlex)}>
          {stream.id}
          <CopyButton stringToCopy={stream.id} />
        </span>
      </InfoRow>
      <InfoRow title="Stream Created">
        <span className={styles.font14}>
          {format(new Date(Number(stream.timestamp_created) / 1000000), 'PP \'at\' p')}
        </span>
      </InfoRow>
      <InfoRow title="Remaining">
        <span className={styles.font14}>
          {timeLeft || 'Finished'}
        </span>
      </InfoRow>
      {stream.timestamp_created !== stream.last_action &&
        <InfoRow title="Latest Withdrawal">
        <span className={styles.font14}>
          {format(new Date(Number(stream.last_action) / 1000000), 'PP \'at\' p')}
        </span>
        </InfoRow>
      }
    </div>
  );
}

export function StreamPage() {
  const { id } = useParams() as { id: string };
  const streamSWR = useSingleStream(id);

  const stream = streamSWR.data;
  const pageError = streamSWR.error;

  return (
    <div className={styles.root}>
      <Layout>
        <div className={styles.breadbrumbs}>
          <Link
            to={ROUTES_MAP.streams.path}
            className={styles.streamsLink}
          >
            Streams
          </Link>
          <BreadcrumbIcon className={styles.breadbrumb} />
          {id}
        </div>
        <div className={styles.backButton}>
          <Button
            displayMode={ButtonDisplayMode.simple}
            onClick={() => window.history.back()}
          >
            Back
          </Button>
        </div>
        {pageError &&
          <PageError
            className="max-w-2xl mx-auto py-32"
            message={pageError.message}
            onRetry={() => {
              streamSWR.mutate();
            }}
          />
        }
        {!pageError && !stream &&
          <div className="py-32 text-center text-gray text-2xl">Loading...</div>
        }

        {!pageError && stream &&
          <main className={styles.stream}>
            <div className={styles.left}>
              <div className={classNames(styles.tile, styles.remaining)}>
                <span className={styles.blockTitle}>
                  Remaining
                </span>
                <span>
                  {streamViewData(stream).timeLeft || 'Finished'}
                </span>
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
              <OtherInfo stream={stream} />
            </div>
          </main>
        }
      </Layout>
    </div>
  );
}
