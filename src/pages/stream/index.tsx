import React, {useState} from 'react';
import { useParams, Link } from 'react-router-dom';
import copy from 'clipboard-copy';
import classNames from 'classnames';
import { format, isPast } from 'date-fns';
import Modal from 'react-modal';

import { streamViewData, useSingleStream } from 'features/roketo-resource';
import { LinkIcon } from '@ui/icons/Link';
import { getStreamLink, ROUTES_MAP } from 'shared/helpers/routing';
import { PageError } from 'shared/components/PageError';
import {DropdownOpener} from 'shared/kit/DropdownOpener';
import {Button, ButtonType} from '@ui/components/Button';
import {Input} from '@ui/components/Input';
import { Layout } from '@ui/components/Layout';
import type { RoketoStream } from 'shared/api/roketo/interfaces/entities';
import { getStreamingSpeed } from 'features/create-stream/lib';
import { useRoketoContext } from 'app/roketo-context';
import { ProgressBar } from '@ui/components/ProgressBar';
import { StreamControls } from 'features/stream-control/StreamControls';
import { STREAM_DIRECTION, useGetStreamDirection } from 'shared/hooks/useGetStreamDirection';
import { STREAM_STATUS } from 'shared/api/roketo/constants';
import { useBool } from 'shared/hooks/useBool';
import { WithdrawButton } from 'features/stream-control/WithdrawButton';
import { TokenImage } from 'shared/kit/TokenImage';
import { getRoundedPercentageRatio } from 'shared/helpers/math';
import { getAvailableToWithdraw } from 'shared/api/roketo/helpers';
import { Badge } from 'shared/components/Badge';

import styles from './styles.module.scss';
import { BreadcrumbIcon } from './BreadcrumbIcon';

function StreamProgress({ stream }: { stream: RoketoStream }) {
  const { tokens } = useRoketoContext();

  const { meta, formatter } = tokens[stream.token_account_id];
  const { progress: { streamed, withdrawn, full }, percentages } = streamViewData(stream);

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
        total={full}
        streamed={streamed}
        withdrawn={withdrawn}
        cliffPercent={percentages.cliff}
        withBigCliffMark
      />
    </div>
  );
}

function StreamButtons({stream}: {stream: RoketoStream}) {
  const {isDead} = streamViewData(stream);
  const direction = useGetStreamDirection(stream);
  const addFundsModal = useBool(false);
  const [deposit, setDeposit] = useState('');

  if (isDead) {
    return null;
  }

  return (
    <div className={styles.buttons}>
      <Modal
        isOpen={addFundsModal.on}
        onRequestClose={addFundsModal.turnOff}
        className={styles.modalContent}
        overlayClassName={styles.modalOverlay}
      >
        <form onSubmit={(e) => {
          e.preventDefault()
          addFundsModal.turnOff()

          /** add api request here */

          setDeposit('');
        }}>
          <h2 className={styles.modalHeader}>Amount to deposit</h2>
          <p>
            <Input
              required
              name="deposit"
              placeholder="0.00 NEAR"
              value={deposit ?? ''}
              onChange={(e) => {
                const rawText = e.currentTarget.value;
                if (rawText.length === 0) {
                  setDeposit('')
                } else if (!Number.isNaN(+rawText)) {
                  setDeposit(rawText);
                }
              }}
            />
            <div className={styles.dueDate}>
              <span className={styles.dueDateLabel}>New due date:</span>
              <span className={styles.dueDateValue}>-</span>
            </div>
          </p>
          <div className={styles.modalButtons}>
            <button
              type="button"
              onClick={addFundsModal.turnOff}
              className={classNames(styles.modalButton, styles.modalSecondary)}
            >
              Cancel
            </button>
            <Button
              type={ButtonType.submit}
              className={styles.modalButton}
              disabled={deposit === '' || Number.isNaN(+deposit)}
            >Add funds</Button>
          </div>
        </form>
      </Modal>
      <Button onClick={addFundsModal.turnOn}>Add funds</Button>
      <StreamControls stream={stream} />

      {direction === STREAM_DIRECTION.IN && stream.status === STREAM_STATUS.Active &&
        <WithdrawButton stream={stream} />
      }
    </div>
  );
}

function StreamSpeed({stream}: {stream: RoketoStream}) {
  const {tokens} = useRoketoContext();

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

function InfoRow({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className={styles.infoRow}>
      <span className={styles.infoTitle}>{title}</span>
      {children}
    </div>
  );
}

function StreamData({stream}: {stream: RoketoStream}) {
  const direction = useGetStreamDirection(stream);
  const {tokens} = useRoketoContext();
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
          {format(
            new Date(Number(stream.timestamp_created) / 1000000),
            "PP 'at' p",
          )}
        </span>
      </InfoRow>
      {cliffEndTimestamp && (
        <InfoRow title={isPast(cliffEndTimestamp) ? 'Cliff Period Ended' : 'Cliff Period Ends'}>
          <span className={styles.font14}>
            {format(cliffEndTimestamp, "PP 'at' p")}
          </span>
        </InfoRow>
      )}
      {streamEndTimestamp && (
        <InfoRow title={isPast(streamEndTimestamp) ? 'Stream Ended' : 'Stream Ends'}>
          <span className={styles.font14}>
            {format(streamEndTimestamp, "PP 'at' p")}
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
          {stream.timestamp_created !== stream.last_action && (
            <InfoRow title="Latest Withdrawal">
              <span className={styles.font14}>
                {format(
                  new Date(Number(stream.last_action) / 1000000),
                  "PP 'at' p",
                )}
              </span>
            </InfoRow>
          )}
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

export function StreamPage() {
  const {id} = useParams() as {id: string};
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
                {stream.is_locked && <Badge isOrange className={styles.closeBadge}>Locked</Badge>}
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
