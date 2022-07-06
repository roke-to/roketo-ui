import cn from 'classnames';
import {useGate, useStoreMap} from 'effector-react';
import React from 'react';

import {$accountStreams} from '~/entities/wallet';

import {RoketoStream} from '~/shared/api/roketo/interfaces/entities';

import {Button} from '@ui/components/Button';
import {Spinner} from '@ui/components/Spinner';

import {filteredStreamsGate} from '../../model';
import {StreamCard} from '../StreamCard';
import styles from './styles.module.scss';

type Props = {
  displayingStreams: RoketoStream[] | undefined;

  onCreateStreamClick: () => void;

  className?: string;
};

const EmptyState = ({children}: {children: React.ReactNode}) => (
  <div className={styles.emptyState}>{children}</div>
);

export const StreamsList = ({className, displayingStreams, onCreateStreamClick}: Props) => {
  const {loading, hasStreams} = useStoreMap($accountStreams, (value) => ({
    loading: !value.streamsLoaded,
    hasStreams: value.inputs.length + value.outputs.length > 0,
  }));

  const hasDisplayedStreams = (displayingStreams?.length ?? 0) > 0;

  useGate(filteredStreamsGate, displayingStreams);

  if (loading) {
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

        {displayingStreams?.map((stream) => (
          <StreamCard
            stream={stream}
            key={stream.id}
            className={cn(styles.withPaddings, 'grid grid-cols-6 gap-x-10')}
          />
        ))}
      </section>
    </div>
  );
};
