import React, {useCallback} from 'react';
import cn from 'classnames';
import copy from 'clipboard-copy';

import {LinkIcon} from '@ui/icons/Link';

import { StreamControls } from '../../../../stream-control/StreamControls';

import {getLegacyStreamLink} from '../../../../routing';
import {LegacyRoketoStream} from '../../../../api/roketo/interfaces/entities';

import styles from './styles.module.scss';

const StreamLinkButton = ({onCLick}: { onCLick: (event: React.SyntheticEvent) => void }) => (
  <button className={styles.linkButton} type="button" onClick={onCLick}>
    <LinkIcon/>
  </button>
);

type Props = {
  stream: LegacyRoketoStream,
  className?: string,
}

export const Controls = ({className, stream}: Props) => {
  const {id: streamId} = stream;

  const handleLinkClick = useCallback((event: React.SyntheticEvent) => {
    event.preventDefault();

    const streamLink = getLegacyStreamLink(streamId);

    copy(streamLink);
  }, [streamId]);

  return (
    <div className={cn(styles.root, className)}>
      <StreamControls stream={stream} />

      <StreamLinkButton onCLick={handleLinkClick}/>
    </div>
  );
};
