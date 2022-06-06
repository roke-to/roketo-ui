import cn from 'classnames';
import React from 'react';
import {generatePath, Link} from 'react-router-dom';

import {RoketoStream} from '~/shared/api/roketo/interfaces/entities';
import {STREAM_DIRECTION, useGetStreamDirection} from '~/shared/hooks/useGetStreamDirection';
import {ROUTES_MAP} from '~/shared/lib/routing';

import {Controls} from '../Controls';
import {Name} from '../Name';
import {StreamProgress} from '../StreamProgress';
import styles from './styles.module.scss';

type StreamCardProps = {
  stream: RoketoStream;
  className?: string;
};

export const StreamCard = ({stream, className}: StreamCardProps) => {
  const {id, description} = stream;

  let comment = '';

  try {
    const parsedDescription = JSON.parse(description);
    comment = parsedDescription.comment ?? parsedDescription.c;
  } catch {
    comment = description;
  }

  const isIncomingStream = useGetStreamDirection(stream) === STREAM_DIRECTION.IN;

  const name = isIncomingStream ? stream.owner_id : stream.receiver_id;

  const streamPageLink = generatePath(ROUTES_MAP.stream.path, {id});

  return (
    <div className={cn(styles.root, className)}>
      <Link to={streamPageLink} className={styles.name}>
        <Name name={name} isOutgoing={!isIncomingStream} isLocked={stream.is_locked} />
      </Link>

      <StreamProgress stream={stream} className={styles.withMarginRight} />

      <Link to={streamPageLink} className="col-span-2 grow-0">
        <p className={styles.comment}>{comment}</p>
      </Link>

      <Controls stream={stream} className={cn(styles.controls, 'col-span-2 grow-0')} />
    </div>
  );
};
