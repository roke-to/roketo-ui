import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { isToday, isYesterday, differenceInDays, format } from 'date-fns';
import { generatePath, Link } from 'react-router-dom';

import { ROUTES_MAP } from 'shared/helpers/routing';
import { notificationsApiClient, useNotifications, NotificationType, Notification } from 'shared/api/roketo-web';
import { DropdownOpener } from 'shared/kit/DropdownOpener';
import { DropdownMenu } from 'shared/kit/DropdownMenu';
import { STREAM_DIRECTION, useGetStreamDirection } from 'shared/hooks/useGetStreamDirection';
import { useRoketoContext } from 'app/roketo-context';
import { streamViewData } from 'features/roketo-resource';

import styles from './styles.module.scss';

import { BellIcon } from './BellIcon';
import { FinishIcon } from './FinishIcon';
import { StartIcon } from './StartIcon';
import { PauseIcon } from './PauseIcon';

function NotificationIcon({ type }: { type: NotificationType }) {
  const IconComponent = (() => {
    switch (type) {
      case 'StreamStarted': return StartIcon;
      case 'StreamPaused': return PauseIcon;
      case 'StreamFinished': return FinishIcon;
      case 'StreamIsDue': return FinishIcon;
      case 'StreamContinued': return StartIcon;
      default: throw new Error('This should never happen');
    }
  })();

  return <IconComponent className={styles.icon} />;
}

const WITHOUT_EXTRAPOLATION = false;

function NotificationBody({ notification: { type, payload: stream } }: { notification: Notification }) {
  const { tokens } = useRoketoContext();
  const direction = useGetStreamDirection(stream);
  const { progress: { full, streamed, left }, timeLeft } = streamViewData(stream, WITHOUT_EXTRAPOLATION);

  const { meta: { symbol }, formatter } = tokens[stream.token_account_id];

  switch (type) {
    case 'StreamStarted': return (
      <div className={styles.notificationBody}>
        <div className={styles.mainText}>
          {
            direction === STREAM_DIRECTION.IN
              ? <>{stream.owner_id} <strong>started</strong> a stream for you to receive.</>
              : <>You’ve successfully <strong>started</strong> a stream to {stream.receiver_id}.</>
          }
        </div>
        <div className={styles.secondaryText}>Total streaming amount: <strong>{formatter.amount(full)} {symbol}</strong></div>
        <div className={styles.secondaryText}>Stream duration: <strong>{timeLeft}</strong></div>
      </div>
    );
    case 'StreamPaused': return (
      <div className={styles.notificationBody}>
        <div className={styles.mainText}>The stream {direction === STREAM_DIRECTION.IN ? `from ${stream.owner_id}` : `to ${stream.receiver_id}`} is <strong>paused</strong>.</div>

        <div className={styles.secondaryText}>Already streamed: <strong>{formatter.amount(streamed)} {symbol}</strong></div>
        <div className={styles.secondaryText}>Amount left: <strong>{formatter.amount(left)} {symbol}</strong></div>
      </div>
    );
    case 'StreamFinished': return (
      <div className={styles.notificationBody}>
        <div className={styles.mainText}>The stream {direction === STREAM_DIRECTION.IN ? `from ${stream.owner_id}` : `to ${stream.receiver_id}`} has <strong>ended</strong>.</div>
        <div className={styles.secondaryText}>Total amount streamed: <strong>{formatter.amount(full)} {symbol}</strong></div>
      </div>
    );
    case 'StreamIsDue': return (
      <div className={styles.notificationBody}>
        <div className={styles.mainText}>The stream from {stream.owner_id} is <strong>due</strong>.</div>
        <div className={styles.secondaryText}>Available for withdrawal: <strong>{formatter.amount(left)} {symbol}</strong></div>
      </div>
    );
    case 'StreamContinued': return (
      <div className={styles.notificationBody}>
        <div className={styles.mainText}>
          {
            direction === STREAM_DIRECTION.IN
              ? <>{stream.owner_id} has <strong>continued</strong> the stream.</>
              : <>The stream to {stream.receiver_id} was <strong>continued</strong>.</>
          }
        </div>
        <div className={styles.secondaryText}>Amount left: <strong>{formatter.amount(left)} {symbol}</strong></div>
        <div className={styles.secondaryText}>Time left: <strong>{timeLeft}</strong></div>
      </div>
    );
    default: throw new Error('This should never happen');
  }
}

export function Notifications() {
  const [isDropdownOpened, setIsDropdownOpened] = useState(false);
  const notificationsSWR = useNotifications();

  useEffect(() => {
    if (!isDropdownOpened || !notificationsSWR.data) {
      return;
    }

    notificationsSWR.mutate(
      async (notifications) => {
        await notificationsApiClient.markAllRead();

        return notifications;
      },
      { revalidate: false }
    );
  }, [isDropdownOpened, notificationsSWR]);

  const hasUnreadNotifications = notificationsSWR.data?.some(({ isRead }) => !isRead) ?? false;

  return (
    <div className={styles.root}>
      <DropdownOpener
        onChange={setIsDropdownOpened}
        className={styles.dropdownOpener}
        opened={isDropdownOpened}
      >
        <BellIcon withBadge={hasUnreadNotifications} />
      </DropdownOpener>

      <DropdownMenu
        opened={isDropdownOpened}
        onClose={() => setIsDropdownOpened(false)}
        className={styles.dropdownMenu}
      >
        <div className={styles.container}>
          <header className={styles.header} >
            Notifications
          </header>
          {!notificationsSWR.data &&
            <h3 className="text-3xl text-center my-12 mx-auto">
              Loading...
            </h3>
          }

          {notificationsSWR.data?.length === 0 &&
            <h3 className="text-3xl text-center my-12 mx-auto">
              Your notifications will be displayed here.
            </h3>
          }

          {notificationsSWR.data?.map((notification, index, notifications) => (
            <>
              {index !== 0 && <div className={styles.divider} />}
              {(index === 0 || differenceInDays(new Date(notifications[index - 1].createdAt), new Date(notification.createdAt))) > 0 &&
                <div className={styles.date}>
                  {isToday(new Date(notification.createdAt))
                    ? 'Today'
                    : isYesterday(new Date(notification.createdAt))
                      ? 'Yesterday'
                      : format(new Date(notification.createdAt), 'PP')
                  }
                </div>
              }
              <Link
                to={generatePath(ROUTES_MAP.stream.path, { id: notification.payload.id })}
                key={notification.id}
                className={classNames(
                  styles.notification,
                  !notification.isRead && styles.unread
                )}
                onClick={() => setIsDropdownOpened(false)}
              >
                <NotificationIcon type={notification.type} />
                <NotificationBody notification={notification} />
                <div className={styles.time}>{format(new Date(notification.createdAt), 'HH:mm')}</div>
              </Link>
            </>
          ))}
        </div>
      </DropdownMenu>
    </div>
  );
}
