import React from 'react';
import cn from 'classnames';

import {RoketoStream} from 'shared/api/roketo/interfaces/entities';

import {StreamCard} from '../StreamCard';
import styles from './styles.module.scss';

type Props = {
  className?: string,
  
  streams: RoketoStream[],
}

export const StreamsList = ({streams, className}: Props) => (
    <section className={cn(styles.flexColumn, className)}>
      <div className={cn(styles.withPaddings, 'grid grid-cols-6 gap-x-10')}>
        <h3 className={styles.title}>Name</h3>
        <h3 className={styles.title}>Amount to stream</h3>
        <h3 className={styles.title}>Comment</h3>
      </div>

      {streams.map(stream => (
        <StreamCard
          stream={stream}
          key={stream.id}
          className={cn(styles.withPaddings, 'grid grid-cols-6 gap-x-10')}/>
      ))}
    </section>
  );
