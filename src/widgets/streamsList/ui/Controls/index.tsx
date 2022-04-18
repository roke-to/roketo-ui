import React, {useCallback} from 'react';
import cn from 'classnames';
import copy from 'clipboard-copy';

import {LinkIcon} from '@uikit/icons/Link';
import {WithdrawButton} from '@app/features/stream-control/WithdrawButton';

import {getStreamLink} from '@app/shared/helpers/routing';
import {RoketoStream} from '@app/shared/api/roketo/interfaces/entities';

import {STREAM_DIRECTION, useGetStreamDirection} from '@app/shared/hooks/useGetStreamDirection';

import {isActiveStream} from '@app/entites/stream/lib';
import styles from './styles.module.scss';

const StreamLinkButton = ({onCLick}: { onCLick: (event: React.SyntheticEvent) => void }) => (
  <button className={styles.linkButton} type="button" onClick={onCLick}>
    <LinkIcon/>
  </button>
);

type Props = {
  stream: RoketoStream,
  className?: string,
}

export const Controls = (props: Props) => {
  const {className, stream} = props;
  const {id: streamId} = stream;

  const handleLinkClick = useCallback((event: React.SyntheticEvent) => {
    event.preventDefault();

    const streamLink = getStreamLink(streamId);

    copy(streamLink);
  }, [streamId]);

  const direction = useGetStreamDirection(stream);
  const showWithdraw = direction === STREAM_DIRECTION.IN && isActiveStream(stream);

  return (
    <div className={cn(styles.root, className)}>

      {showWithdraw &&
        <WithdrawButton stream={stream} />
      }

      <StreamLinkButton onCLick={handleLinkClick}/>
    </div>
  );
};
