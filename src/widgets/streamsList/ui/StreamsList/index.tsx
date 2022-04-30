import React from 'react';
import cn from 'classnames';

import {RoketoStream} from 'shared/api/roketo/interfaces/entities';

import {Button} from '@ui/components/Button';

import {useStreams} from 'features/roketo-resource';

import {StreamCard} from '../StreamCard';
import styles from './styles.module.scss';

type Props = {
  displayingStreams: RoketoStream[] | undefined,

  onCreateStreamClick: () => void,

  className?: string,
}

const EmptyState = ({children}: {children: React.ReactNode}) => <div className={styles.emptyState}>{children}</div>

export const StreamsList = (props: Props) => {
  const {
    className,
    displayingStreams,
    onCreateStreamClick,
  } = props;

  const {data: streams} = useStreams();
  const {inputs = [], outputs = []} = streams || {};

  const allStreams = [...inputs, ...outputs];
  const allStreamsLength = allStreams.length;

  const displayingStreamsLength = displayingStreams?.length;

  return (
    <section className={cn(styles.flexColumn, className)}>
      <div className={cn(styles.withPaddings, 'grid grid-cols-6 gap-x-10')}>
        <h3 className={styles.title}>Name</h3>
        <h3 className={styles.title}>Amount to stream</h3>
        <h3 className={styles.title}>Comment</h3>
      </div>

      {!streams &&
        <EmptyState>
          <div>Loading...</div>
        </EmptyState>
      }

      {streams && allStreamsLength === 0 &&
        <EmptyState>
          <div>
            You dont have any streams yet.
          </div>
          <Button onClick={onCreateStreamClick}>Create First Stream</Button>
        </EmptyState>

      }

      {streams && allStreamsLength !== 0 && displayingStreamsLength === 0 &&
        <EmptyState>
          <div>No streams matching your filters. Try selecting different ones</div>
        </EmptyState>
      }

      {displayingStreams?.map(stream => (
        <StreamCard
          stream={stream}
          key={stream.id}
          className={cn(styles.withPaddings, 'grid grid-cols-6 gap-x-10')}/>
      ))}
    </section>
  );
}
