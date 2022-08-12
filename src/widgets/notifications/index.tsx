import type {Notification, NotificationTypeEnum as NotificationType} from '@roketo/api-client';
import {calculateTimeLeft, getStreamProgress} from '@roketo/sdk';
import type {RoketoStream} from '@roketo/sdk/dist/types';
import classNames from 'classnames';
import {useGate, useList, useStore, useStoreMap} from 'effector-react';
import React from 'react';
import {Link} from 'react-router-dom';

import {blurGate} from '~/entities/blur';
import {$notifications} from '~/entities/wallet';

import {formatAmount} from '~/shared/api/token-formatter';
import {testIds} from '~/shared/constants';
import {useGetStreamDirection} from '~/shared/hooks/useGetStreamDirection';
import {useMediaQuery} from '~/shared/hooks/useMatchQuery';
import {useToken} from '~/shared/hooks/useToken';
import {AdaptiveModal} from '~/shared/kit/AdaptiveModal';
import {DropdownOpener} from '~/shared/kit/DropdownOpener';

import {Spinner} from '@ui/components/Spinner';

import {BellIcon} from './BellIcon';
import streamCliffPassedIcon from './icons/streamCliffPassed.svg';
import streamEndedIcon from './icons/streamEnded.svg';
import streamFundsAddedIcon from './icons/streamFundsAdded.svg';
import streamIsDueIcon from './icons/streamIsDue.svg';
import streamPausedIcon from './icons/streamPaused.svg';
import streamStartedIcon from './icons/streamStarted.svg';
import {
  $hasUnreadNotifications,
  $notificationsContent,
  $panelIsVisible,
  closePanel,
  setPanelVisibility,
} from './model';
import styles from './styles.module.scss';

function NotificationIcon({type}: {type: NotificationType}) {
  const iconUrls = {
    StreamStarted: streamStartedIcon,
    StreamPaused: streamPausedIcon,
    StreamFinished: streamEndedIcon,
    StreamIsDue: streamIsDueIcon,
    StreamContinued: streamStartedIcon,
    StreamCliffPassed: streamCliffPassedIcon,
    StreamFundsAdded: streamFundsAddedIcon,
  } as const;
  return <img className={styles.icon} src={iconUrls[type]} alt="notification icon" />;
}

function PrimaryText({children}: {children: React.ReactNode}) {
  return <div className={styles.primaryText}>{children}</div>;
}

function SecondaryText({children}: {children: React.ReactNode}) {
  return <div className={styles.secondaryText}>{children}</div>;
}

function NotificationBody({notification: {type, payload}}: {notification: Notification}) {
  const stream: RoketoStream = 'stream' in payload ? payload.stream : payload;

  const direction = useGetStreamDirection(stream);
  const timeLeft = calculateTimeLeft(stream, stream.last_action);
  const {full, streamed, left} = getStreamProgress({
    stream,
    progressAtTimestamp: stream.last_action,
  });

  const token = useToken(stream.token_account_id);
  if (!token) return null;
  const {
    meta: {symbol, decimals},
  } = token;
  switch (type) {
    case 'StreamStarted':
      return (
        <>
          <PrimaryText>
            {direction === 'IN' ? (
              <>
                {stream.owner_id} <strong>started</strong> a stream for you to receive
              </>
            ) : (
              <>
                You've successfully <strong>started</strong> a stream to {stream.receiver_id}
              </>
            )}
          </PrimaryText>
          <SecondaryText>
            Total streaming amount:{' '}
            <strong>
              {formatAmount(decimals, full)}&nbsp;{symbol}
            </strong>
          </SecondaryText>
          <SecondaryText>
            Stream duration: <strong>{timeLeft}</strong>
          </SecondaryText>
        </>
      );
    case 'StreamPaused':
      return (
        <>
          <PrimaryText>
            The stream {direction === 'IN' ? `from ${stream.owner_id}` : `to ${stream.receiver_id}`}{' '}
            is <strong>paused</strong>
          </PrimaryText>

          <SecondaryText>
            Already streamed:{' '}
            <strong>
              {formatAmount(decimals, streamed)}&nbsp;{symbol}
            </strong>
          </SecondaryText>
          <SecondaryText>
            Amount left:{' '}
            <strong>
              {formatAmount(decimals, left)}&nbsp;{symbol}
            </strong>
          </SecondaryText>
        </>
      );
    case 'StreamFinished':
      return (
        <>
          <PrimaryText>
            The stream {direction === 'IN' ? `from ${stream.owner_id}` : `to ${stream.receiver_id}`}{' '}
            has <strong>ended</strong>.
          </PrimaryText>
          <SecondaryText>
            Total amount streamed:{' '}
            <strong>
              {formatAmount(decimals, full)}&nbsp;{symbol}
            </strong>
          </SecondaryText>
        </>
      );
    case 'StreamIsDue':
      return (
        <>
          <PrimaryText>
            The stream from {stream.owner_id} is <strong>due</strong>
          </PrimaryText>
          <SecondaryText>
            Available for withdrawal:{' '}
            <strong>
              {formatAmount(decimals, left)}&nbsp;{symbol}
            </strong>
          </SecondaryText>
        </>
      );
    case 'StreamContinued':
      return (
        <>
          <PrimaryText>
            {direction === 'IN' ? (
              <>
                {stream.owner_id} has <strong>continued</strong> the stream
              </>
            ) : (
              <>
                The stream to {stream.receiver_id} was <strong>continued</strong>
              </>
            )}
          </PrimaryText>
          <SecondaryText>
            Amount left:{' '}
            <strong>
              {formatAmount(decimals, left)}&nbsp;{symbol}
            </strong>
          </SecondaryText>
          <SecondaryText>
            Time left: <strong>{timeLeft}</strong>
          </SecondaryText>
        </>
      );
    case 'StreamCliffPassed':
      return (
        <>
          <PrimaryText>
            The stream {direction === 'IN' ? `from ${stream.owner_id}` : `to ${stream.receiver_id}`}{' '}
            has <strong>passed the cliff period</strong>
          </PrimaryText>
          <SecondaryText>
            Available for withdrawal:{' '}
            <strong>
              {formatAmount(decimals, left)}&nbsp;{symbol}
            </strong>
          </SecondaryText>
        </>
      );
    case 'StreamFundsAdded':
      return (
        <>
          <PrimaryText>
            <strong>The funds were added</strong> to the stream{' '}
            {direction === 'IN' ? `from ${stream.owner_id}` : `to ${stream.receiver_id}`}
          </PrimaryText>
          <SecondaryText>
            Added amount:{' '}
            <strong>
              {formatAmount(decimals, payload.fundsAdded)}&nbsp;{symbol}
            </strong>
          </SecondaryText>
        </>
      );
    default:
      throw new Error('This should never happen');
  }
}

interface NotificationsProps {
  arrowClassName?: string;
}

export function Notifications({arrowClassName}: NotificationsProps) {
  const isPanelVisible = useStore($panelIsVisible);
  const hasUnreadNotifications = useStore($hasUnreadNotifications);
  const compact = useMediaQuery('(max-width: 767px)');
  const initialLoading = useStoreMap($notifications, (notifications) => notifications === null);
  const hasNotifications = useStoreMap($notifications, (items) => Boolean(items?.length));
  useGate(blurGate, {
    modalId: 'notifications',
    active: compact && isPanelVisible,
  });
  return (
    <div className={styles.root}>
      <DropdownOpener
        onChange={setPanelVisibility}
        className={styles.dropdownOpener}
        arrowClassName={arrowClassName}
        opened={isPanelVisible}
        testId={testIds.openNotificationsButton}
      >
        <BellIcon withBadge={hasUnreadNotifications} />
      </DropdownOpener>
      <AdaptiveModal
        compact={compact}
        isOpen={isPanelVisible}
        onClose={closePanel}
        modalClassName={styles.panel}
        dropdownClassName={classNames(styles.panel, styles.dropdownPanel)}
      >
        <div className={styles.container} data-testid={testIds.notificationsContainer}>
          {initialLoading && (
            <Spinner wrapperClassName={styles.loader} testId={testIds.notificationsLoader} />
          )}
          {!initialLoading && !hasNotifications && (
            <h3 className="text-3xl text-center my-12 mx-auto">
              Your notifications will be displayed here
            </h3>
          )}
          {useList($notificationsContent, {
            getKey: ({notification}) => notification.id,
            // eslint-disable-next-line react/no-unstable-nested-components
            fn: ({notification, link, dateTime}) => (
              <Link
                to={link}
                className={classNames(styles.notification, !notification.isRead && styles.unread)}
                onClick={closePanel}
              >
                <NotificationIcon type={notification.type} />
                <NotificationBody notification={notification} />
                <div className={styles.time}>{dateTime}</div>
              </Link>
            ),
          })}
        </div>
      </AdaptiveModal>
    </div>
  );
}
