import cn from 'classnames';
import copy from 'clipboard-copy';
import {useList, useStore, useStoreMap} from 'effector-react';
import React, {memo} from 'react';
import {Link} from 'react-router-dom';

import {StreamListControls} from '~/features/stream-control/StreamControls';

import {Badge} from '~/shared/components/Badge';
import {getStreamLink} from '~/shared/lib/routing';

import {Button} from '@ui/components/Button';
import {Spinner} from '@ui/components/Spinner';
import {LinkIcon} from '@ui/icons/Link';

import {streamCardDataDefaults} from '../constants';
import {$filteredStreams, $streamCardsData, $streamListData} from '../model';
import {StreamProgress} from '../StreamProgress';
import activeStreamIcon from './activeStream.svg';
import finishedStreamIcon from './finishedStream.svg';
import menuDotsIcon from './menuDots.svg';
import pausedStreamIcon from './pausedStream.svg';
import styles from './styles.module.scss';

const EmptyState = ({children}: {children: React.ReactNode}) => (
  <div className={styles.emptyState}>{children}</div>
);

const StreamNameLink = memo(({streamId}: {streamId: string}) => {
  const {streamPageLink, name, isLocked} = useStoreMap({
    store: $streamCardsData,
    keys: [streamId],
    fn: (items) => items[streamId],
    defaultValue: streamCardDataDefaults,
  });
  return (
    <Link to={streamPageLink} className={cn(styles.nameCell)}>
      <span className={styles.nameText}>{name}</span>

      {isLocked && <Badge isOrange>Locked</Badge>}
    </Link>
  );
});

const StreamCommentLink = memo(({streamId}: {streamId: string}) => {
  const {streamPageLink, comment} = useStoreMap({
    store: $streamCardsData,
    keys: [streamId],
    fn: (items) => items[streamId],
    defaultValue: streamCardDataDefaults,
  });
  return (
    <Link to={streamPageLink} className={cn(styles.commentCell)}>
      <div className={styles.commentBlock}>{comment}</div>
    </Link>
  );
});

const StreamCards = ({className}: {className: string}) => (
  <div className={cn(styles.container, className)}>
    <section className={styles.streamGrid}>
      <h3 className={cn(styles.leftStickyCell, styles.title)}>Amount to stream</h3>
      <h3 className={styles.title}>Wallet address</h3>
      <h3 className={styles.title}>Comment</h3>

      {useList($filteredStreams, {
        getKey: ({id}) => id,
        fn(stream) {
          const {id: streamId} = stream;
          const {
            color,
            showAddFundsButton,
            showWithdrawButton,
            showStartButton,
            showPauseButton,
            iconType,
            // eslint-disable-next-line react-hooks/rules-of-hooks
          } = useStoreMap({
            store: $streamCardsData,
            keys: [streamId],
            fn: (items) => items[streamId],
            defaultValue: streamCardDataDefaults,
          });
          const statusIconUrl = (() => {
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
          })();
          return (
            <>
              <div className={styles.colorCell} style={{'--stream-color': color} as any} />
              <div className={cn(styles.statusCell)}>
                <img src={statusIconUrl} alt="Stream status" className={styles.streamStatusIcon} />
              </div>

              <StreamProgress
                streamId={stream.id}
                className={cn(styles.progressCell, styles.leftStickyCell)}
              />

              <StreamNameLink streamId={stream.id} />

              <StreamCommentLink streamId={stream.id} />

              <div className={cn(styles.controlCell)}>
                <button
                  className={styles.streamLinkButton}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    copy(getStreamLink(streamId));
                  }}
                >
                  <LinkIcon />
                </button>
                <StreamListControls
                  stream={stream}
                  dropdownClassName={styles.controlDropdown}
                  showAddFundsButton={showAddFundsButton}
                  showWithdrawButton={showWithdrawButton}
                  showStartButton={showStartButton}
                  showPauseButton={showPauseButton}
                  openerClassName={styles.streamActionsButton}
                  openerContent={
                    <img
                      src={menuDotsIcon}
                      alt="Open stream actions"
                      className={styles.streamActionsIcon}
                    />
                  }
                />
              </div>
            </>
          );
        },
        placeholder: (
          <EmptyState>
            <div>No streams matching your filters. Try selecting different ones</div>
          </EmptyState>
        ),
      })}
    </section>
  </div>
);

export const StreamsList = ({
  onCreateStreamClick,
  className,
}: {
  onCreateStreamClick: () => void;
  className: string;
}) => {
  const {streamsLoading, hasStreams} = useStore($streamListData);

  if (streamsLoading) {
    return (
      <EmptyState>
        <Spinner wrapperClassName={styles.loader} />
      </EmptyState>
    );
  }

  if (!hasStreams) {
    return (
      <EmptyState>
        <div>You don't have any streams yet.</div>
        <Button onClick={onCreateStreamClick}>Create First Stream</Button>
      </EmptyState>
    );
  }

  return <StreamCards className={className} />;
};
