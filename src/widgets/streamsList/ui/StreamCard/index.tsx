import React from 'react';
import cn from 'classnames';
import {generatePath, Link} from 'react-router-dom';

import {RoketoStream} from 'shared/api/roketo/interfaces/entities';
import {ROUTES_MAP} from 'shared/helpers/routing';
import {STREAM_DIRECTION, useGetStreamDirection} from 'shared/hooks/useGetStreamDirection';

import {Name} from '../Name';
import {StreamProgress} from '../StreamProgress';

import {Controls} from '../Controls';
import styles from './styles.module.scss';

type StreamCardProps = {
  stream: RoketoStream,
  className?: string,
}

export const StreamCard = ({stream, className}: StreamCardProps) => {
  const {
    id,
    description,
  } = stream;

  let comment = '';

  try {
    const parsedDescription = JSON.parse(description);
    comment = parsedDescription.comment;
  } catch {
    comment = description;
  }

  const isIncomingStream = useGetStreamDirection(stream) === STREAM_DIRECTION.IN;

  const name = isIncomingStream ? stream.owner_id : stream.receiver_id;
  const label = isIncomingStream ? undefined : 'Send';

  const streamPageLink = generatePath(ROUTES_MAP.stream.path, {id});

  return (
    <div className={cn(styles.root, className)}>
      <Link to={streamPageLink} className={styles.name}>
        <Name name={name} label={label}/>
      </Link>

      <StreamProgress stream={stream} className={styles.withMarginRight} />

      <Link to={streamPageLink} className='col-span-2 grow-0'>
        <p className={styles.comment}>
          {comment}
        </p>
      </Link>


      <Controls
        stream={stream}
        className={cn(styles.controls, 'col-span-2 grow-0')}
      />
    </div>
  );
};
