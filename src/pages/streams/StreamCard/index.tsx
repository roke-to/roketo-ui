import cn from 'classnames';
import copy from 'clipboard-copy';
import {useStoreMap} from 'effector-react';
import React, {memo, useCallback} from 'react';
import {Link} from 'react-router-dom';

import {AddFunds, useShouldShowAddFundsButton} from '~/features/add-funds';
import {StreamControls} from '~/features/stream-control/StreamControls';
import {WithdrawButton} from '~/features/stream-control/WithdrawButton';

import {STREAM_DIRECTION} from '~/shared/api/roketo/constants';
import type {RoketoStream} from '~/shared/api/roketo/interfaces/entities';
import {isActiveStream} from '~/shared/api/roketo/lib';
import {Badge} from '~/shared/components/Badge';
import {useGetStreamDirection} from '~/shared/hooks/useGetStreamDirection';
import {ColorDot} from '~/shared/kit/ColorDot';
import {getStreamLink} from '~/shared/lib/routing';

import {LinkIcon} from '@ui/icons/Link';

import {streamCardDataDefaults} from '../constants';
import {$streamCardsData} from '../model';
import {StreamProgress} from '../StreamProgress';
import styles from './styles.module.scss';

const StreamNameLink = memo(({streamId}: {streamId: string}) => {
  const {streamPageLink, color, name, isIncomingStream, isLocked} = useStoreMap({
    store: $streamCardsData,
    keys: [streamId],
    fn: (items) => items[streamId],
    defaultValue: streamCardDataDefaults,
  });
  return (
    <Link to={streamPageLink} className={styles.name}>
      <ColorDot color={color} size={10} className={styles.colorDot} />
      <div className={styles.nameBlock}>
        <span className={styles.nameText}>{name}</span>

        {!isIncomingStream && <Badge>Sending</Badge>}

        {isLocked && <Badge isOrange>Locked</Badge>}
      </div>
    </Link>
  );
});

const StreamCommentLink = memo(({streamId}: {streamId: string}) => {
  const {streamPageLink, comment} = useStoreMap({
    store: $streamCardsData,
    keys: [streamId],
    fn: (items) => items[streamId],
    defaultValue: streamCardDataDefaults,
  });
  return (
    <Link to={streamPageLink} className="col-span-2 grow-0">
      <p className={styles.comment}>{comment}</p>
    </Link>
  );
});

const Controls = ({stream}: {stream: RoketoStream}) => {
  const {id: streamId} = stream;

  const handleLinkClick = useCallback(
    (event: React.SyntheticEvent) => {
      event.preventDefault();

      const streamLink = getStreamLink(streamId);

      copy(streamLink);
    },
    [streamId],
  );

  const shouldShowAddFundsButton = useShouldShowAddFundsButton(stream);

  const direction = useGetStreamDirection(stream);
  const showWithdraw = direction === STREAM_DIRECTION.IN && isActiveStream(stream);

  return (
    <div className={cn(styles.controlBlock, styles.controls, 'col-span-2 grow-0')}>
      {shouldShowAddFundsButton && <AddFunds small stream={stream} />}
      {showWithdraw && <WithdrawButton stream={stream} small />}

      <StreamControls stream={stream} />

      <button className={styles.streamLinkButton} type="button" onClick={handleLinkClick}>
        <LinkIcon />
      </button>
    </div>
  );
};

export const StreamCard = ({stream, className}: {stream: RoketoStream; className?: string}) => (
  <div className={cn(styles.root, className)}>
    <StreamNameLink streamId={stream.id} />

    <StreamProgress streamId={stream.id} className={styles.withMarginRight} />

    <StreamCommentLink streamId={stream.id} />

    <Controls stream={stream} />
  </div>
);
