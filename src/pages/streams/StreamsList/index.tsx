import cn from 'classnames';
import {useList, useStore} from 'effector-react';
import React from 'react';

import {Button} from '@ui/components/Button';
import {Spinner} from '@ui/components/Spinner';

import {$filteredStreams, $streamListData} from '../model';
import {StreamCard} from '../StreamCard';
import styles from './styles.module.scss';

const EmptyState = ({children}: {children: React.ReactNode}) => (
  <div className={styles.emptyState}>{children}</div>
);

export const StreamsList = ({
  onCreateStreamClick,
  className,
}: {
  onCreateStreamClick: () => void;
  className: string;
}) => {
  const {streamsLoading, hasStreams, hasDisplayedStreams} = useStore($streamListData);

  const streamCards = useList($filteredStreams, {
    getKey: ({id}) => id,
    fn: (stream) => (
      <StreamCard
        stream={stream}
        className={cn(styles.withPaddings, 'grid grid-cols-6 gap-x-10')}
      />
    ),
  });

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

  if (!hasDisplayedStreams) {
    return (
      <EmptyState>
        <div>No streams matching your filters. Try selecting different ones</div>
      </EmptyState>
    );
  }

  return (
    <div className={cn(styles.container, className)}>
      <section className={styles.flexColumn}>
        <div className={cn(styles.withPaddings, 'grid grid-cols-6 gap-x-10')}>
          <h3 className={styles.title}>Wallet address</h3>
          <h3 className={styles.title}>Amount to stream</h3>
          <h3 className={styles.title}>Comment</h3>
        </div>

        {streamCards}
      </section>
    </div>
  );
};
