import type {RoketoStream} from '@roketo/sdk/dist/types';
import cn from 'classnames';
import {useList, useStore, useStoreMap, useUnit} from 'effector-react';
import React, {memo, ReactNode} from 'react';
import {Link} from 'react-router-dom';

import {$isSmallScreen} from '~/entities/screen';

import {getStreamLink} from '~/shared/lib/routing';

import {CopyLinkButton} from '@ui/components/CopyLinkButton';
import {Spinner} from '@ui/components/Spinner';

import {streamCardDataDefaults} from '../constants';
import {
  $filteredStreams,
  $selectedStream,
  $streamCardsData,
  $streamListData,
  selectStream,
} from '../model';
import styles from './styles.module.scss';

const ConditionalLink = ({
  children,
  to,
  className,
  streamId,
}: {
  children: ReactNode;
  to: string;
  className: string;
  streamId: string;
}) => {
  const isSmallScreen = useUnit($isSmallScreen);

  return !isSmallScreen && to ? (
    <Link to={to} className={className}>
      {children}
    </Link>
  ) : (
    /* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
    <div className={className} onClick={() => selectStream(streamId)}>
      {children}
    </div>
  );
};

const StreamNameLink = memo(({streamId}: {streamId: string}) => {
  const {streamPageLink, name, direction} = useStoreMap({
    store: $streamCardsData,
    keys: [streamId],
    fn: (items) => items[streamId],
    defaultValue: streamCardDataDefaults,
  });
  return (
    <ConditionalLink to={streamPageLink} className={cn(styles.nameCell)} streamId={streamId}>
      <span className={styles.nameText} data-direction={direction}>
        {name}
      </span>
    </ConditionalLink>
  );
});

const StreamAmountLink = memo(({streamId}: {streamId: string}) => {
  const {total, symbol, streamPageLink} = useStoreMap({
    store: $streamCardsData,
    keys: [streamId],
    fn: (items) => items[streamId],
    defaultValue: streamCardDataDefaults,
  });
  return (
    <ConditionalLink to={streamPageLink} className={styles.amountCell} streamId={streamId}>
      <div className={styles.amountBlock}>
        {total} <span className={styles.symbol}>{symbol}</span>
      </div>
    </ConditionalLink>
  );
});

const StreamDateLink = memo(({streamId, type}: {streamId: string; type: string}) => {
  const {start, end, streamPageLink} = useStoreMap({
    store: $streamCardsData,
    keys: [streamId],
    fn: (items) => items[streamId],
    defaultValue: streamCardDataDefaults,
  });
  return (
    <Link to={streamPageLink} className={type === 'start' ? styles.startCell : styles.endCell}>
      <div>{type === 'start' ? start : end}</div>
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

const ViewDetailsLink = memo(({to}: {to: string}) => (
  <Link to={to} className={styles.viewDetails}>
    View details
  </Link>
));

const CollapsedStreamRow = ({stream}: {stream: RoketoStream}) => {
  const {id: streamId} = stream;
  return (
    <>
      <StreamNameLink streamId={stream.id} />
      <StreamAmountLink streamId={stream.id} />
      <StreamDateLink streamId={stream.id} type="start" />
      <StreamDateLink streamId={stream.id} type="end" />
      <StreamCommentLink streamId={stream.id} />

      <div className={cn(styles.controlCell)}>
        <CopyLinkButton className={styles.streamLinkButton} link={getStreamLink(streamId)} />
      </div>
    </>
  );
};

const ExpandedStreamCard = ({stream}: {stream: RoketoStream}) => {
  const {id: streamId} = stream;
  const {direction, comment, start, end, streamPageLink} = useStoreMap({
    store: $streamCardsData,
    keys: [streamId],
    fn: (items) => items[streamId],
    defaultValue: streamCardDataDefaults,
  });
  return (
    <div className={styles.expandedInfo}>
      <div className={styles.expandedHeader}>
        <StreamNameLink streamId={stream.id} />
        <StreamAmountLink streamId={stream.id} />
      </div>
      <div className={styles.direction}>{direction === 'in' ? 'Incoming' : 'Outgoing'} stream</div>
      <CopyLinkButton className={styles.link} link={getStreamLink(streamId)} />
      <div className={styles.comment}>Stream start: {start}</div>
      <div className={styles.comment}>Stream end: {end}</div>

      {comment && <div className={styles.comment}>{comment}</div>}
      <ViewDetailsLink to={streamPageLink} />
    </div>
  );
};

const Placeholder = () => {
  const {streamsLoading, hasStreams} = useStore($streamListData);
  if (streamsLoading) return <Spinner wrapperClassName={styles.loader} />;
  if (!hasStreams) {
    return <div>You don't have any archived streams yet.</div>;
  }
  return <div>No streams matching your filters. Try selecting different ones</div>;
};

export const ArchivedStreamsList = ({className}: {className: string}) => (
  <div className={cn(styles.container, className)}>
    <section className={styles.streamGrid}>
      <h3 className={styles.title}>Wallet address</h3>
      <h3 className={styles.title}>Amount was streamed</h3>
      <h3 className={styles.title}>Stream start</h3>
      <h3 className={styles.title}>Stream end</h3>
      <h3 className={styles.title}>Comment</h3>

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
            <Placeholder />
          </div>
        ),
      })}
    </section>
  </div>
);
