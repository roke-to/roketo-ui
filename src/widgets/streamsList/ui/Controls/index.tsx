import cn from 'classnames';
import copy from 'clipboard-copy';
import React, {useCallback} from 'react';

import {StreamControls} from '~/features/stream-control/StreamControls';
import {WithdrawButton} from '~/features/stream-control/WithdrawButton';
import {RoketoStream} from '~/shared/api/roketo/interfaces/entities';
import {isActiveStream} from '~/shared/api/roketo/lib';
import {STREAM_DIRECTION, useGetStreamDirection} from '~/shared/hooks/useGetStreamDirection';
import {getStreamLink} from '~/shared/lib/routing';

import {LinkIcon} from '@ui/icons/Link';

import styles from './styles.module.scss';

const StreamLinkButton = ({onCLick}: {onCLick: (event: React.SyntheticEvent) => void}) => (
  <button className={styles.linkButton} type="button" onClick={onCLick}>
    <LinkIcon />
  </button>
);

type Props = {
  stream: RoketoStream;
  className?: string;
};

export const Controls = ({className, stream}: Props) => {
  const {id: streamId} = stream;

  const handleLinkClick = useCallback(
    (event: React.SyntheticEvent) => {
      event.preventDefault();

      const streamLink = getStreamLink(streamId);

      copy(streamLink);
    },
    [streamId],
  );

  const direction = useGetStreamDirection(stream);
  const showWithdraw = direction === STREAM_DIRECTION.IN && isActiveStream(stream);

  return (
    <div className={cn(styles.root, className)}>
      {showWithdraw && <WithdrawButton stream={stream} small />}

      <StreamControls stream={stream} />

      <StreamLinkButton onCLick={handleLinkClick} />
    </div>
  );
};
