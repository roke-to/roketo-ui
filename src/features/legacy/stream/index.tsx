import React, {useState} from 'react';
import { useParams, Link } from 'react-router-dom';
import copy from 'clipboard-copy';
import classNames from 'classnames';
import { format, isPast } from 'date-fns';

import { LinkIcon } from '@ui/icons/Link';
import { PageError } from 'shared/components/PageError';
import {DropdownOpener} from 'shared/kit/DropdownOpener';
import { Layout } from '@ui/components/Layout';
import { getStreamingSpeed } from 'features/create-stream/lib';
import { useRoketoContext } from 'app/roketo-context';
import { ProgressBar } from '@ui/components/ProgressBar';
import { TokenImage } from 'shared/kit/TokenImage';
import { getRoundedPercentageRatio } from 'shared/helpers/math';
import { env } from 'shared/config';

import { STREAM_STATUS } from '../api/roketo/constants';
import { StreamControls } from '../stream-control/StreamControls';
import { STREAM_DIRECTION, useGetStreamDirection } from '../hooks/useGetStreamDirection';
import { streamViewData, useAccount, useLegacySingleStream } from '../roketo-resource';
import type { LegacyRoketoStream } from '../api/roketo/interfaces/entities';
import { getLegacyStreamLink, LEGACY_ROUTES_MAP } from '../routing';
import { BreadcrumbIcon } from './BreadcrumbIcon';
import styles from './styles.module.scss';
import { TICK_TO_S } from '../api/roketo/config';
import { WithdrawAllButton } from '../stream-control/WithdrawAllButton';

function StreamProgress({ stream }: { stream: LegacyRoketoStream }) {
  const { tokens } = useRoketoContext();

  const { meta, formatter } = tokens[stream.ticker === 'NEAR' ? env.WNEAR_ID : stream.ticker];
  const { progress: { streamed, withdrawn, full } } = streamViewData(stream);

  return (
    <div>
      <div className={styles.numericProgress}>
        <TokenImage
          tokenAccountId={stream.ticker === 'NEAR' ? env.WNEAR_ID : stream.ticker}
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

function StreamButtons({stream}: {stream: LegacyRoketoStream}) {
  const {isDead} = streamViewData(stream);
  const direction = useGetStreamDirection(stream);

  if (isDead) {
    return null;
  }

  return (
    <div className={styles.buttons}>
      <StreamControls stream={stream} />

      {direction === STREAM_DIRECTION.IN && stream.status === STREAM_STATUS.ACTIVE && stream.available_to_withdraw !== '0' &&
        <WithdrawAllButton>Withdraw all</WithdrawAllButton>
      }
    </div>
  );
}

function StreamSpeed({stream}: {stream: LegacyRoketoStream}) {
  const {tokens} = useRoketoContext();

  return (
    <div>
      <span className={styles.blockTitle}>Speed</span>
      <div className={styles.speed}>
        {getStreamingSpeed(Number(stream.tokens_per_tick) * TICK_TO_S, tokens[stream.ticker === 'NEAR' ? env.WNEAR_ID : stream.ticker])}
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
      <div className={styles.commentBody}>
        {comment}
      </div>
    </div>
  );
}

function CopyButton({stringToCopy}: {stringToCopy: string}) {
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

function InfoRow({ title, children }: { title: string, children: React.ReactNode }) {
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

  const streamedToTotalPercentageRatio = getRoundedPercentageRatio(streamed, full).toNumber();
  const leftToTotalPercentageRatio = getRoundedPercentageRatio(left, full).toNumber();
  const available = Number(stream.available_to_withdraw);

  const {meta, formatter} = tokens[stream.ticker === 'NEAR' ? env.WNEAR_ID : stream.ticker];
  
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
          {format(
            new Date(Number(stream.timestamp_created) / 1000000),
            "PP 'at' p",
          )}
        </span>
      </InfoRow>
      {streamEndInfo !== null && (
        <InfoRow title={isPast(streamEndInfo) ? 'Stream Ended' : 'Stream Ends'}>
          <span className={styles.font14}>
            {format(new Date(streamEndInfo), "PP 'at' p")}
          </span>
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
              <span className={classNames(styles.font14, styles.streamID)}>
                {stream.id}
              </span>
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
                <span className={styles.grey}>
                  ({streamedToTotalPercentageRatio}%)
                </span>
              </span>
            </span>
          </InfoRow>
          <InfoRow title="Tokens Left">
            <span className={styles.font14}>
              {formatter.amount(left)}&nbsp;
              <span className={styles.font12}>
                {meta.symbol}{' '}
                <span className={styles.grey}>
                  ({leftToTotalPercentageRatio}%)
                </span>
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
          <Link
            to={LEGACY_ROUTES_MAP.legacyStreams.path}
            className={styles.streamsLink}
          >
            Streams (legacy)
          </Link>
          <BreadcrumbIcon className={styles.breadbrumb} />
          <span className={styles.id}>{id}</span>
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
            </div>
          </main>
        }
      </Layout>
    </div>
  );
}