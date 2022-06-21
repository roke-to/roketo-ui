import type {Notification, NotificationTypeEnum as NotificationType} from '@roketo/api-client';
import classNames from 'classnames';
import {format, isSameDay, isToday, isYesterday} from 'date-fns';
import {useStore} from 'effector-react';
import React, {useCallback, useState} from 'react';
import {generatePath, Link} from 'react-router-dom';

import {streamViewData} from '~/features/roketo-resource';

import {$notifications} from '~/entities/wallet';

import {formatAmount} from '~/shared/api/ft/token-formatter';
import {testIds} from '~/shared/constants';
import {STREAM_DIRECTION, useGetStreamDirection} from '~/shared/hooks/useGetStreamDirection';
import {useMediaQuery} from '~/shared/hooks/useMatchQuery';
import {useToken} from '~/shared/hooks/useToken';
import {DropdownMenu} from '~/shared/kit/DropdownMenu';
import {DropdownOpener} from '~/shared/kit/DropdownOpener';
import {ROUTES_MAP} from '~/shared/lib/routing';

import {BangIcon} from './BangIcon';
import {BellIcon} from './BellIcon';
import {FinishIcon} from './FinishIcon';
import {dropdownClosed} from './model';
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
        <div className={styles.notificationBody}>
          <PrimaryText>
            {direction === STREAM_DIRECTION.IN ? (
              <>
                {stream.owner_id} <strong>started</strong> a stream for you to receive.
              </>
            ) : (
              <>
                You’ve successfully <strong>started</strong> a stream to {stream.receiver_id}.
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
        </div>
      );
    case 'StreamPaused':
      return (
        <div className={styles.notificationBody}>
          <PrimaryText>
            The stream{' '}
            {direction === STREAM_DIRECTION.IN
              ? `from ${stream.owner_id}`
              : `to ${stream.receiver_id}`}{' '}
            is <strong>paused</strong>.
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
        </div>
      );
    case 'StreamFinished':
      return (
        <div className={styles.notificationBody}>
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
        </div>
      );
    case 'StreamIsDue':
      return (
        <div className={styles.notificationBody}>
          <PrimaryText>
            The stream from {stream.owner_id} is <strong>due</strong>.
          </PrimaryText>
          <SecondaryText>
            Available for withdrawal:{' '}
            <strong>
              {formatAmount(decimals, left)}&nbsp;{symbol}
            </strong>
          </SecondaryText>
        </div>
      );
    case 'StreamContinued':
      return (
        <div className={styles.notificationBody}>
          <PrimaryText>
            {direction === STREAM_DIRECTION.IN ? (
              <>
                {stream.owner_id} has <strong>continued</strong> the stream.
              </>
            ) : (
              <>
                The stream to {stream.receiver_id} was <strong>continued</strong>.
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
        </div>
      );
    case 'StreamCliffPassed':
      return (
        <div className={styles.notificationBody}>
          <PrimaryText>
            The stream{' '}
            {direction === STREAM_DIRECTION.IN
              ? `from ${stream.owner_id}`
              : `to ${stream.receiver_id}`}{' '}
            has <strong>passed the cliff period</strong>.
          </PrimaryText>
          <SecondaryText>
            Available for withdrawal:{' '}
            <strong>
              {formatAmount(decimals, left)}&nbsp;{symbol}
            </strong>
          </SecondaryText>
        </div>
      );
    case 'StreamFundsAdded':
      return (
        <div className={styles.notificationBody}>
          <PrimaryText>
            <strong>The funds were added</strong> to the stream{' '}
            {direction === STREAM_DIRECTION.IN
              ? `from ${stream.owner_id}`
              : `to ${stream.receiver_id}`}{' '}
            .
          </PrimaryText>
          <SecondaryText>
            Added amount:{' '}
            <strong>
              {formatAmount(decimals, payload.fundsAdded)}&nbsp;{symbol}
            </strong>
          </SecondaryText>
        </div>
      );
    default:
      throw new Error('This should never happen');
  }
}

export function Notifications() {
  const compact = useMediaQuery('(max-width: 645px)');

  const [isDropdownOpened, setIsDropdownOpened] = useState(false);
  const notifications = useStore($notifications);

  const closeDropdown = useCallback(() => {
    setIsDropdownOpened(false);
    dropdownClosed();
  }, []);

  const hasUnreadNotifications = notifications.some(({isRead}) => !isRead) ?? false;

  return (
    <div className={styles.root}>
      <DropdownOpener
        onChange={setIsDropdownOpened}
        className={styles.dropdownOpener}
        opened={isDropdownOpened}
        testId={testIds.openNotificationsButton}
      >
        <BellIcon withBadge={hasUnreadNotifications} />
      </DropdownOpener>

      <DropdownMenu
        opened={isDropdownOpened}
        onClose={closeDropdown}
        className={classNames(styles.dropdownMenu, compact && styles.compact)}
      >
        <div className={styles.container} data-testid={testIds.notificationsContainer}>
          <header className={styles.header}>Notifications</header>

          {notifications.length === 0 && (
            <h3 className="text-3xl text-center my-12 mx-auto">
              Your notifications will be displayed here.
            </h3>
          )}

          {notifications.map((notification, index) => (
            <React.Fragment key={notification.id}>
              {index !== 0 && <div className={styles.divider} />}
              {(index === 0 ||
                !isSameDay(notifications[index - 1].createdAt, notification.createdAt)) && (
                <div className={styles.date}>
                  {isToday(notification.createdAt)
                    ? 'Today'
                    : isYesterday(notification.createdAt)
                    ? 'Yesterday'
                    : format(notification.createdAt, 'PP')}
                </div>
              )}
              <Link
                to={generatePath(ROUTES_MAP.stream.path, {
                  id:
                    'stream' in notification.payload
                      ? notification.payload.stream.id
                      : notification.payload.id,
                })}
                className={classNames(styles.notification, !notification.isRead && styles.unread)}
                onClick={closeDropdown}
              >
                <NotificationIcon type={notification.type} />
                <NotificationBody notification={notification} />
                <div className={styles.time}>
                  {format(new Date(notification.createdAt), 'HH:mm')}
                </div>
              </Link>
            </React.Fragment>
          ))}
        </div>
      </DropdownMenu>
    </div>
  );
}
