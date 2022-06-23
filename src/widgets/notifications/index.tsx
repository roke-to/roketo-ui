import type {Notification, NotificationTypeEnum as NotificationType} from '@roketo/api-client';
import classNames from 'classnames';
import {useList, useStore, useStoreMap} from 'effector-react';
import React from 'react';
import Modal from 'react-modal';
import {Link} from 'react-router-dom';

import {streamViewData} from '~/features/roketo-resource';

import {$notifications} from '~/entities/wallet';

import {formatAmount} from '~/shared/api/ft/token-formatter';
import {testIds} from '~/shared/constants';
import {STREAM_DIRECTION, useGetStreamDirection} from '~/shared/hooks/useGetStreamDirection';
import {useMediaQuery} from '~/shared/hooks/useMatchQuery';
import {useToken} from '~/shared/hooks/useToken';
import {DropdownMenu} from '~/shared/kit/DropdownMenu';
import {DropdownOpener} from '~/shared/kit/DropdownOpener';

import {BangIcon} from './BangIcon';
import {BellIcon} from './BellIcon';
import {FinishIcon} from './FinishIcon';
import {
  $hasUnreadNotifications,
  $notificationsContent,
  $panelIsVisible,
  closePanel,
  setPanelVisibility,
} from './model';
import {PauseIcon} from './PauseIcon';
import {StartIcon} from './StartIcon';
import styles from './styles.module.scss';

function NotificationIcon({type}: {type: NotificationType}) {
  const IconComponent = (() => {
    switch (type) {
      case 'StreamStarted':
        return StartIcon;
      case 'StreamPaused':
        return PauseIcon;
      case 'StreamFinished':
        return FinishIcon;
      case 'StreamIsDue':
        return BangIcon;
      case 'StreamContinued':
        return StartIcon;
      case 'StreamCliffPassed':
        return BangIcon;
      case 'StreamFundsAdded':
        return BangIcon;
      default:
        throw new Error('This should never happen');
    }
  })();

  return <IconComponent className={styles.icon} />;
}

const WITHOUT_EXTRAPOLATION = false;

function PrimaryText({children}: {children: React.ReactNode}) {
  return <div className={styles.primaryText}>{children}</div>;
}

function SecondaryText({children}: {children: React.ReactNode}) {
  return <div className={styles.secondaryText}>{children}</div>;
}

function NotificationBody({notification: {type, payload}}: {notification: Notification}) {
  const stream = 'stream' in payload ? payload.stream : payload;

  const direction = useGetStreamDirection(stream);
  const {
    progress: {full, streamed, left},
    timeLeft,
  } = streamViewData(stream, WITHOUT_EXTRAPOLATION);

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
            {direction === STREAM_DIRECTION.IN ? (
              <>
                {stream.owner_id} <strong>started</strong> a stream for you to receive
              </>
            ) : (
              <>
                You’ve successfully <strong>started</strong> a stream to {stream.receiver_id}
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
            The stream{' '}
            {direction === STREAM_DIRECTION.IN
              ? `from ${stream.owner_id}`
              : `to ${stream.receiver_id}`}{' '}
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
            The stream{' '}
            {direction === STREAM_DIRECTION.IN
              ? `from ${stream.owner_id}`
              : `to ${stream.receiver_id}`}{' '}
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
            {direction === STREAM_DIRECTION.IN ? (
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
            The stream{' '}
            {direction === STREAM_DIRECTION.IN
              ? `from ${stream.owner_id}`
              : `to ${stream.receiver_id}`}{' '}
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
            {direction === STREAM_DIRECTION.IN
              ? `from ${stream.owner_id}`
              : `to ${stream.receiver_id}`}
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

function Filler() {
  const hasNotifications = useStoreMap($notifications, (items) => items.length > 0);
  return hasNotifications ? null : (
    <h3 className="text-3xl text-center my-12 mx-auto">
      Your notifications will be displayed here
    </h3>
  );
}
function NotificationsList() {
  return (
    <div className={styles.container} data-testid={testIds.notificationsContainer}>
      <header className={styles.header}>Notifications</header>
      <Filler />
      {useList($notificationsContent, {
        getKey: ({notification}) => notification.id,
        // eslint-disable-next-line react/no-unstable-nested-components
        fn: ({notification, needDivider, link, dateTime}) => (
          <>
            {needDivider && <div className={styles.divider} />}
            <Link
              to={link}
              className={classNames(styles.notification, !notification.isRead && styles.unread)}
              onClick={closePanel}
            >
              <NotificationIcon type={notification.type} />
              <NotificationBody notification={notification} />
              <div className={styles.time}>{dateTime}</div>
            </Link>
          </>
        ),
      })}
    </div>
  );
}

export function Notifications() {
  const isPanelVisible = useStore($panelIsVisible);
  const hasUnreadNotifications = useStore($hasUnreadNotifications);
  const compact = useMediaQuery('(max-width: 767px)');
  return (
    <div className={styles.root}>
      <DropdownOpener
        onChange={setPanelVisibility}
        className={styles.dropdownOpener}
        opened={isPanelVisible}
        testId={testIds.openNotificationsButton}
      >
        <BellIcon withBadge={hasUnreadNotifications} />
      </DropdownOpener>
      {compact ? (
        <Modal
          isOpen={isPanelVisible}
          onRequestClose={closePanel}
          className={styles.panel}
          overlayClassName={styles.modalOverlay}
        >
          <NotificationsList />
        </Modal>
      ) : (
        <DropdownMenu
          opened={isPanelVisible}
          onClose={closePanel}
          className={classNames(styles.panel, styles.dropdownPanel)}
        >
          <NotificationsList />
        </DropdownMenu>
      )}
    </div>
  );
}
