import React from 'react';
import cn from 'classnames';

import {useStreams} from 'features/roketo-resource';

import {StreamCard} from '../StreamCard';

import styles from './styles.module.scss';

type Props = {
  className?: string,
}

export const StreamsList = ({className}: Props) => {
  const {data: streams} = useStreams();

  const {inputs, outputs} = streams || {};

  const allStreams = [...(inputs ?? []), ...(outputs ?? [])];

  return (
    <section className={cn(styles.flexColumn, className)}>
      <div className={cn(styles.withPaddings, 'grid grid-cols-6 gap-x-10')}>
        <h3 className={styles.title}>Name</h3>
        <h3 className={styles.title}>Amount to stream</h3>
        <h3 className={styles.title}>Comment</h3>
      </div>

      {allStreams.map(stream => (
        <StreamCard
          stream={stream}
          key={stream.id}
          className={cn(styles.withPaddings, 'grid grid-cols-6 gap-x-10')}/>
      ))}
    </section>
  );
};
