import React, {useCallback} from 'react';
import cn from 'classnames';
import copy from 'clipboard-copy';

import {LinkIcon} from '@ui/icons/Link';

import {WithdrawButton} from 'features/stream-control/WithdrawButton';

import {getStreamLink} from 'shared/helpers/routing';
import {isActiveStream} from 'shared/api/roketo/helpers';
import {RoketoStream} from 'shared/api/roketo/interfaces/entities';

import {STREAM_DIRECTION, useGetStreamDirection} from 'shared/hooks/useGetStreamDirection';
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
        <WithdrawButton stream={stream}/>
      }

      <StreamLinkButton onCLick={handleLinkClick}/>
    </div>
  );
};
