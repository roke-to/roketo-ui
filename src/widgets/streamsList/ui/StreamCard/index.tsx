import cn from 'classnames';
import {useStoreMap} from 'effector-react';
import React, {memo} from 'react';
import {Link} from 'react-router-dom';

import type {RoketoStream} from '~/shared/api/roketo/interfaces/entities';
import {ColorDot} from '~/shared/kit/ColorDot';

import {$streamCardsData, streamCardDataDefaults} from '../../model';
import {Controls} from '../Controls';
import {Name} from '../Name';
import {StreamProgress} from '../StreamProgress';
import styles from './styles.module.scss';

type StreamCardProps = {
  stream: RoketoStream;
  className?: string;
};

const StreamNameLink = memo(({streamId}: {streamId: string}) => {
  const {streamPageLink, color, name, isIncomingStream, isLocked} = useStoreMap({
    store: $streamCardsData,
    keys: [streamId],
    fn: (items) => items[streamId] ?? streamCardDataDefaults,
  });
  return (
    <Link to={streamPageLink} className={styles.name}>
      <ColorDot color={color} size={10} className={styles.colorDot} />
      <Name name={name} isOutgoing={!isIncomingStream} isLocked={isLocked} />
    </Link>
  );
});

const StreamCommentLink = memo(({streamId}: {streamId: string}) => {
  const {streamPageLink, comment} = useStoreMap({
    store: $streamCardsData,
    keys: [streamId],
    fn: (items) => items[streamId] ?? streamCardDataDefaults,
  });
  return (
    <Link to={streamPageLink} className="col-span-2 grow-0">
      <p className={styles.comment}>{comment}</p>
    </Link>
  );
});

export const StreamCard = ({stream, className}: StreamCardProps) => (
  <div className={cn(styles.root, className)}>
    <StreamNameLink streamId={stream.id} />

    <StreamProgress streamId={stream.id} className={styles.withMarginRight} />

    <StreamCommentLink streamId={stream.id} />

    <Controls stream={stream} className={cn(styles.controls, 'col-span-2 grow-0')} />
  </div>
);
