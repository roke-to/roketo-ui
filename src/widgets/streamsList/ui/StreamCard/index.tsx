import React from 'react';
import cn from 'classnames';
import {generatePath, Link} from 'react-router-dom';

import {RoketoStream} from 'shared/api/roketo/interfaces/entities';
import {ROUTES_MAP} from 'shared/helpers/routing';

import {useToken} from 'shared/hooks/useToken';
import {STREAM_DIRECTION, useGetStreamDirection} from 'shared/hooks/useGetStreamDirection';
import {streamViewData} from 'features/roketo-resource';

import {Name} from '../Name';
import {StreamStatus} from '../StreamStatus';

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
    token_account_id: tokenAccountId,
  } = stream;

  const {progress, ...rest} = streamViewData(stream);

  console.log({stream, rest});

  const {formatter, meta} = useToken(tokenAccountId);

  const streamed = Number(formatter.toHumanReadableValue(progress.streamed));
  const withdrawn = Number(formatter.toHumanReadableValue(progress.withdrawn));
  const total = Number(formatter.toHumanReadableValue(progress.full));

  const isIncomingStream = useGetStreamDirection(stream) === STREAM_DIRECTION.IN;

  const name = isIncomingStream ? stream.owner_id : stream.receiver_id;
  const label = isIncomingStream ? undefined : 'Send';

  const streamPageLink = generatePath(ROUTES_MAP.stream.path, {id});

  return (
    <div className={cn(styles.root, styles.flexCenter, className)}>

      <Link to={streamPageLink}>
        <Name name={name} label={label}/>
      </Link>


      <StreamStatus
        streamed={streamed}
        withdrawn={withdrawn}
        total={total}
        symbol={meta.symbol}
      />

      <Link to={streamPageLink} className='col-span-2 grow-0'>
        <p className={styles.description}>
          {description}
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eaque in iste libero officiis perspiciatis provident,
          quasi repellendus tempora veritatis voluptates? Assumenda atque fuga magni officia placeat quaerat quos
          recusandae sapiente.
        </p>
      </Link>


      <Controls
        stream={stream}
        className={cn(styles.controls, 'col-span-2 grow-0')}
      />
    </div>
  );
};
