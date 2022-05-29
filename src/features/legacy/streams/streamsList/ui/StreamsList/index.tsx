import React from 'react';
import cn from 'classnames';

import {Button} from '@ui/components/Button';
import {Spinner} from '@ui/components/Spinner';

import {LegacyRoketoStream} from '../../../../api/roketo/interfaces/entities';
import { useAccount, useLegacyStreams } from '../../../../roketo-resource';

import {StreamCard} from '../StreamCard';
import styles from './styles.module.scss';

type Props = {
  displayingStreams: LegacyRoketoStream[] | undefined,

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

  const accountSWR = useAccount();

  const {data: streams} = useLegacyStreams({ account: accountSWR.data });
  const {inputs = [], outputs = []} = streams || {};

  const allStreams = [...inputs, ...outputs];
  const allStreamsLength = allStreams.length;

  const displayingStreamsLength = displayingStreams?.length ?? 0;

  if (!streams) {
    return (
      <EmptyState>
        <Spinner wrapperClassName={styles.loader} />
      </EmptyState>
    );
  }

  if (streams && allStreamsLength === 0) {
    return (
      <EmptyState>
        <div>
          You don't have any streams yet.
        </div>
        <Button onClick={onCreateStreamClick}>Create First Stream</Button>
      </EmptyState>
    );
  }

  if (streams && allStreamsLength !== 0 && displayingStreamsLength === 0) {
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

        {displayingStreams?.map(stream => (
          <StreamCard
            stream={stream}
            key={stream.id}
            className={cn(styles.withPaddings, 'grid grid-cols-6 gap-x-10')}
          />
        ))}
      </section>
    </div>
  );
}
