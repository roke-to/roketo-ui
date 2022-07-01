import cn from 'classnames';
import React, {memo} from 'react';
import {generatePath, Link} from 'react-router-dom';

import {STREAM_DIRECTION} from '~/shared/api/roketo/constants';
import type {RoketoStream} from '~/shared/api/roketo/interfaces/entities';
import {useGetStreamDirection} from '~/shared/hooks/useGetStreamDirection';
import {ColorDot} from '~/shared/kit/ColorDot';
import {ROUTES_MAP} from '~/shared/lib/routing';

import {Controls} from '../Controls';
import {Name} from '../Name';
import {StreamProgress} from '../StreamProgress';
import styles from './styles.module.scss';

type StreamCardProps = {
  stream: RoketoStream;
  className?: string;
};

// eslint-disable-next-line prefer-arrow-callback
const StreamNameLink = memo(function StreamNameLink({
  streamPageLink,
  color,
  name,
  isLocked,
  isIncomingStream,
}: {
  streamPageLink: string;
  color: string;
  name: string;
  isLocked: boolean;
  isIncomingStream: boolean;
}) {
  return (
    <Link to={streamPageLink} className={styles.name}>
      <ColorDot color={color} size={10} className={styles.colorDot} />
      <Name name={name} isOutgoing={!isIncomingStream} isLocked={isLocked} />
    </Link>
  );
});

// eslint-disable-next-line prefer-arrow-callback
const StreamCommentLink = memo(function StreamCommentLink({
  streamPageLink,
  comment,
}: {
  streamPageLink: string;
  comment: string;
}) {
  return (
    <Link to={streamPageLink} className="col-span-2 grow-0">
      <p className={styles.comment}>{comment}</p>
    </Link>
  );
});

export const StreamCard = ({stream, className}: StreamCardProps) => {
  const {id, description} = stream;

  let comment = '';
  let color = 'transparent';

  try {
    const parsedDescription = JSON.parse(description);
    comment = parsedDescription.comment ?? parsedDescription.c;
    color = parsedDescription.col;
  } catch {
    comment = description;
  }

  const isIncomingStream = useGetStreamDirection(stream) === STREAM_DIRECTION.IN;

  const name = isIncomingStream ? stream.owner_id : stream.receiver_id;

  const streamPageLink = generatePath(ROUTES_MAP.stream.path, {id});

  return (
    <div className={cn(styles.root, className)}>
      <StreamNameLink
        streamPageLink={streamPageLink}
        color={color}
        name={name}
        isLocked={stream.is_locked}
        isIncomingStream={isIncomingStream}
      />

      <StreamProgress stream={stream} className={styles.withMarginRight} />

      <StreamCommentLink streamPageLink={streamPageLink} comment={comment} />

      <Controls stream={stream} className={cn(styles.controls, 'col-span-2 grow-0')} />
    </div>
  );
};
