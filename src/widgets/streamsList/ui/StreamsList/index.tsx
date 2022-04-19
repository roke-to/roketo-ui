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
    <div className={cn(styles.root, className)}>
      {allStreams.map(stream => <StreamCard stream={stream} key={stream.id} />)}
    </div>
  );
};
