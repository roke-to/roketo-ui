import type {RoketoStream} from '@roketo/sdk/dist/types';
import cn from 'classnames';
import {useList, useStore, useStoreMap} from 'effector-react';
import React, {memo} from 'react';

import {StreamListControls} from '~/features/stream-control/StreamControls';

import type {STREAM_STATUS} from '~/shared/api/roketo/constants';
import {testIds} from '~/shared/constants';
import {ColorDot} from '~/shared/kit/ColorDot';
import {getStreamLink} from '~/shared/lib/routing';

import {Button} from '@ui/components/Button';
import {CopyLinkButton} from '@ui/components/CopyLinkButton';
import {ProgressBar} from '@ui/components/ProgressBar';
import {Spinner} from '@ui/components/Spinner';

import {linkToExplorer, streamCardDataDefaults, streamProgressDataDefaults} from '../constants';
import {
  $filteredStreams,
  $selectedStream,
  $streamCardsData,
  $streamListData,
  $streamsProgress,
} from '../model';
import {StreamProgress} from '../StreamProgress';
import activeStreamIcon from './activeStream.svg';
import finishedStreamIcon from './finishedStream.svg';
import menuDotsIcon from './menuDots.svg';
import pausedStreamIcon from './pausedStream.svg';
import styles from './styles.module.scss';

const StreamNFTContract = memo(({streamId}: {streamId: string}) => {
  const {streamPageLink, nftContract} = useStoreMap({
    store: $streamCardsData,
    keys: [streamId],
    fn: (items) => items[streamId],
    defaultValue: streamCardDataDefaults,
  });
  return (
    <a
      href={streamPageLink}
      target="_blank"
      className={cn(styles.contractCell)}
      data-testid={testIds.streamListReceiver}
      rel="noreferrer"
    >
      <span className={styles.nameText}>{nftContract}</span>
    </a>
  );
});

const StreamNFTId = memo(({streamId}: {streamId: string}) => {
  const {streamPageLink, nftId} = useStoreMap({
    store: $streamCardsData,
    keys: [streamId],
    fn: (items) => items[streamId],
    defaultValue: streamCardDataDefaults,
  });
  return (
    <a
      href={streamPageLink}
      target="_blank"
      className={cn(styles.nftIdCell)}
      data-testid={testIds.streamListReceiver}
      rel="noreferrer"
    >
      <span className={styles.nameText}>{nftId}</span>
    </a>
  );
});

const StreamNameLink = memo(({streamId}: {streamId: string}) => {
  const {streamPageLink, name} = useStoreMap({
    store: $streamCardsData,
    keys: [streamId],
    fn: (items) => items[streamId],
    defaultValue: streamCardDataDefaults,
  });
  return (
    <a
      href={streamPageLink}
      target="_blank"
      className={cn(styles.nameCell)}
      data-testid={testIds.streamListReceiver}
      rel="noreferrer"
    >
      <span className={styles.nameText}>{name}</span>
    </a>
  );
});

const ViewDetailsLink = memo(({to}: {to: string}) => (
  <a href={to} target="_blank" className={styles.viewDetails} rel="noreferrer">
    View details
  </a>
));

function selectIcon(iconType: keyof typeof STREAM_STATUS) {
  switch (iconType) {
    case 'Active':
      return activeStreamIcon;
    case 'Finished':
      return finishedStreamIcon;
    case 'Initialized':
    case 'Paused':
    default:
      return pausedStreamIcon;
  }
}

const CollapsedStreamRow = ({stream}: {stream: RoketoStream}) => {
  const {id: streamId} = stream;
  const {iconType, showWithdrawButton} = useStoreMap({
    store: $streamCardsData,
    keys: [streamId],
    fn: (items) => items[streamId],
    defaultValue: streamCardDataDefaults,
  });
  return (
    <>
      <div className={cn(styles.statusCell)}>
        <img
          src={selectIcon(iconType)}
          alt={iconType}
          className={styles.streamStatusIcon}
          data-testid={testIds.streamStatusIcon}
        />
      </div>

      <StreamProgress
        streamId={stream.id}
        className={cn(styles.progressCell, styles.leftStickyCell)}
      />

      <StreamNameLink streamId={stream.id} />

      <StreamNFTContract streamId={stream.id} />

      <StreamNFTId streamId={stream.id} />

      <div className={cn(styles.controlCell)}>
        <CopyLinkButton className={styles.streamLinkButton} link={`${linkToExplorer}${streamId}`} />
        {showWithdrawButton && (
          <StreamListControls
            stream={stream}
            dropdownClassName={styles.controlDropdown}
            showAddFundsButton={false}
            showWithdrawButton={showWithdrawButton}
            showStartButton={false}
            showPauseButton={false}
            showStopButton={false}
            openerClassName={styles.streamActionsButton}
            openerContent={
              <img
                src={menuDotsIcon}
                alt="Open stream actions"
                className={styles.streamActionsIcon}
              />
            }
          />
        )}
      </div>
    </>
  );
};

const ExpandedStreamCard = ({stream}: {stream: RoketoStream}) => {
  const {id: streamId} = stream;
  const {
    color,
    iconType,
    streamPageLink,
    showAddFundsButton,
    showPauseButton,
    showStartButton,
    showStopButton,
    showWithdrawButton,
    nftContract,
    nftId,
  } = useStoreMap({
    store: $streamCardsData,
    keys: [streamId],
    fn: (items) => items[streamId],
    defaultValue: streamCardDataDefaults,
  });
  const {
    name,
    totalText,
    symbol,
    progressFull,
    progressStreamed,
    progressWithdrawn,
    cliffPercent,
    streamedText,
    withdrawnText,
    withdrawnPercentage,
    direction,
    sign,
  } = useStoreMap({
    store: $streamsProgress,
    keys: [streamId],
    fn: (items) => items[streamId],
    defaultValue: streamProgressDataDefaults,
  });

  return (
    <div className={styles.expandedInfo}>
      <div className={cn(styles.statusIcon)}>
        <img src={selectIcon(iconType)} alt="Stream status" />
      </div>
      <ProgressBar
        total={progressFull}
        streamed={progressStreamed}
        withdrawn={progressWithdrawn}
        cliffPercent={cliffPercent}
        direction={direction}
        className={styles.progressBar}
      >
        <div className={styles.barStatusText}>
          <span className={styles.barStreamName}>{name}</span>
          <div className={styles.barProgressText}>
            {sign}
            {streamedText} of {totalText} <span className={styles.subtext}>{symbol}</span>
          </div>
        </div>
      </ProgressBar>
      {color && <ColorDot className={styles.color} color={color} />}
      <div className={styles.direction}>{direction === 'in' ? 'Incoming' : 'Outgoing'} stream</div>
      <CopyLinkButton className={styles.link} link={getStreamLink(streamId)} />
      <div className={styles.streamed}>
        NFT address:
        <span className={styles.subtext}> {nftContract}</span>
      </div>
      <div className={styles.streamed}>
        NFT ID:
        <span className={styles.subtext}> {nftId}</span>
      </div>
      <div className={styles.streamed}>Streamed: {streamedText} </div>
      <div className={styles.withdrawn}>
        Withdrawn: {withdrawnText}{' '}
        <span className={styles.subtext}>({withdrawnPercentage.toString()}%)</span>
      </div>
      <StreamListControls
        stream={stream}
        dropdownClassName={styles.controlDropdown}
        needToUseBlur
        showAddFundsButton={showAddFundsButton}
        showWithdrawButton={showWithdrawButton}
        showStartButton={showStartButton}
        showPauseButton={showPauseButton}
        showStopButton={showStopButton}
        className={styles.streamActions}
        openerClassName={styles.streamActionsButtonExpanded}
        openerContent="Stream actions"
      />
      <ViewDetailsLink to={streamPageLink} />
    </div>
  );
};

const Placeholder = ({onCreateStreamClick}: {onCreateStreamClick(): void}) => {
  const {streamsLoading, hasStreams} = useStore($streamListData);
  if (streamsLoading)
    return <Spinner wrapperClassName={styles.loader} testId={testIds.streamListLoader} />;
  if (!hasStreams) {
    return (
      <>
        <div>You don't have any streams yet.</div>
        <Button onClick={onCreateStreamClick}>Create First Stream</Button>
      </>
    );
  }
  return <div>No streams matching your filters. Try selecting different ones</div>;
};

export const StreamsList = ({
  onCreateStreamClick,
  className,
}: {
  onCreateStreamClick: () => void;
  className: string;
}) => (
  <div className={cn(styles.container, className)}>
    <section className={styles.streamGrid}>
      <h3 className={cn(styles.leftStickyCell, styles.title)}>Amount to stream</h3>
      <h3 className={styles.title}>Wallet address</h3>
      <h3 className={styles.title}>NFT address</h3>
      <h3 className={styles.title}>NFT ID</h3>

      {useList($filteredStreams, {
        getKey: ({id}) => id,
        fn(stream) {
          const {id: streamId} = stream;
          // eslint-disable-next-line react-hooks/rules-of-hooks
          const isSelected = useStoreMap({
            store: $selectedStream,
            keys: [streamId],
            fn: (selected) => selected === streamId,
          });
          return isSelected ? (
            <ExpandedStreamCard stream={stream} />
          ) : (
            <CollapsedStreamRow stream={stream} />
          );
        },
        placeholder: (
          <div className={styles.emptyState}>
            <Placeholder onCreateStreamClick={onCreateStreamClick} />
          </div>
        ),
      })}
    </section>
  </div>
);
