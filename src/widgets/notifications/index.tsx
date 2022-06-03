import React, { useCallback, useState } from 'react';
import classNames from 'classnames';
import {useStore} from 'effector-react';
import { isToday, isYesterday, isSameDay, format } from 'date-fns';
import { generatePath, Link } from 'react-router-dom';
import type {NotificationTypeEnum as NotificationType, Notification} from '@roketo/api-client'

import {$tokens, $notifications} from '~/services/wallet';

import { ROUTES_MAP } from '~/shared/helpers/routing';
import { DropdownOpener } from '~/shared/kit/DropdownOpener';
import { DropdownMenu } from '~/shared/kit/DropdownMenu';
import { STREAM_DIRECTION, useGetStreamDirection } from '~/shared/hooks/useGetStreamDirection';
import { streamViewData } from '~/features/roketo-resource';
import { useMediaQuery } from '~/shared/hooks/useMatchQuery';
import { testIds } from '~/shared/constants';

import styles from './styles.module.scss';

import { BellIcon } from './BellIcon';
import { FinishIcon } from './FinishIcon';
import { StartIcon } from './StartIcon';
import { PauseIcon } from './PauseIcon';
import { BangIcon } from './BangIcon';
import { markAllReadFx } from './model';

function NotificationIcon({ type }: { type: NotificationType }) {
  const IconComponent = (() => {
    switch (type) {
      case 'StreamStarted': return StartIcon;
      case 'StreamPaused': return PauseIcon;
      case 'StreamFinished': return FinishIcon;
      case 'StreamIsDue': return BangIcon;
      case 'StreamContinued': return StartIcon;
      case 'StreamCliffPassed': return BangIcon;
      default: throw new Error('This should never happen');
    }
  })();

  return <IconComponent className={styles.icon} />;
}

const WITHOUT_EXTRAPOLATION = false;

function PrimaryText({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.primaryText} data-testid={testIds.notificationPrimaryCaption}>{children}</div>
  );
}

function SecondaryText({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.secondaryText} data-testid={testIds.notificationSecondaryCaption}>{children}</div>
  );
}

function NotificationBody({ notification: { type, payload: stream } }: { notification: Notification }) {
  const tokens = useStore($tokens);
  const direction = useGetStreamDirection(stream);
  const { progress: { full, streamed, left }, timeLeft } = streamViewData(stream, WITHOUT_EXTRAPOLATION);

  const { meta: { symbol }, formatter } = tokens[stream.token_account_id];

  switch (type) {
    case 'StreamStarted': return (
      <div className={styles.notificationBody}>
        <PrimaryText>
          {
            direction === STREAM_DIRECTION.IN
              ? <>{stream.owner_id} <strong>started</strong> a stream for you to receive.</>
              : <>You’ve successfully <strong>started</strong> a stream to {stream.receiver_id}.</>
          }
        </PrimaryText>
        <SecondaryText>Total streaming amount: <strong>{formatter.amount(full)}&nbsp;{symbol}</strong></SecondaryText>
        <SecondaryText>Stream duration: <strong>{timeLeft}</strong></SecondaryText>
      </div>
    );
    case 'StreamPaused': return (
      <div className={styles.notificationBody}>
        <PrimaryText>The stream {direction === STREAM_DIRECTION.IN ? `from ${stream.owner_id}` : `to ${stream.receiver_id}`} is <strong>paused</strong>.</PrimaryText>

        <SecondaryText>Already streamed: <strong>{formatter.amount(streamed)}&nbsp;{symbol}</strong></SecondaryText>
        <SecondaryText>Amount left: <strong>{formatter.amount(left)}&nbsp;{symbol}</strong></SecondaryText>
      </div>
    );
    case 'StreamFinished': return (
      <div className={styles.notificationBody}>
        <PrimaryText>The stream {direction === STREAM_DIRECTION.IN ? `from ${stream.owner_id}` : `to ${stream.receiver_id}`} has <strong>ended</strong>.</PrimaryText>
        <SecondaryText>Total amount streamed: <strong>{formatter.amount(full)}&nbsp;{symbol}</strong></SecondaryText>
      </div>
    );
    case 'StreamIsDue': return (
      <div className={styles.notificationBody}>
        <PrimaryText>The stream from {stream.owner_id} is <strong>due</strong>.</PrimaryText>
        <SecondaryText>Available for withdrawal: <strong>{formatter.amount(left)}&nbsp;{symbol}</strong></SecondaryText>
      </div>
    );
    case 'StreamContinued': return (
      <div className={styles.notificationBody}>
        <PrimaryText>
          {
            direction === STREAM_DIRECTION.IN
              ? <>{stream.owner_id} has <strong>continued</strong> the stream.</>
              : <>The stream to {stream.receiver_id} was <strong>continued</strong>.</>
          }
        </PrimaryText>
        <SecondaryText>Amount left: <strong>{formatter.amount(left)}&nbsp;{symbol}</strong></SecondaryText>
        <SecondaryText>Time left: <strong>{timeLeft}</strong></SecondaryText>
      </div>
    );
    case 'StreamCliffPassed': return (
      <div className={styles.notificationBody}>
        <PrimaryText>The stream {direction === STREAM_DIRECTION.IN ? `from ${stream.owner_id}` : `to ${stream.receiver_id}`} has <strong>passed the cliff period</strong>.</PrimaryText>
        <SecondaryText>Available for withdrawal: <strong>{formatter.amount(left)}&nbsp;{symbol}</strong></SecondaryText>
      </div>
    );
    default: throw new Error('This should never happen');
  }
}

export function Notifications() {
  const compact = useMediaQuery('(max-width: 645px)');

  const [isDropdownOpened, setIsDropdownOpened] = useState(false);
  const notifications = useStore($notifications);

  const closeDropdown = useCallback(() => {
    setIsDropdownOpened(false);
    markAllReadFx();
  }, []);

  const hasUnreadNotifications = notifications.some(({ isRead }) => !isRead) ?? false;

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
        <div className={styles.container}>
          <header className={styles.header} >
            Notifications
          </header>

          {notifications.length === 0 &&
            <h3 className="text-3xl text-center my-12 mx-auto">
              Your notifications will be displayed here.
            </h3>
          }

          {notifications.map((notification, index) => (
            <React.Fragment key={notification.id}>
              {index !== 0 && <div className={styles.divider} />}
              {(index === 0 || !isSameDay(notifications[index - 1].createdAt, notification.createdAt)) &&
                <div className={styles.date}>
                  {isToday(notification.createdAt)
                    ? 'Today'
                    : isYesterday(notification.createdAt)
                      ? 'Yesterday'
                      : format(notification.createdAt, 'PP')
                  }
                </div>
              }
              <Link
                to={generatePath(ROUTES_MAP.stream.path, { id: notification.payload.id })}
                className={classNames(
                  styles.notification,
                  !notification.isRead && styles.unread
                )}
                onClick={closeDropdown}
                data-testid={testIds.notificationElement}
              >
                <NotificationIcon type={notification.type} />
                <NotificationBody notification={notification} />
                <div className={styles.time}>{format(new Date(notification.createdAt), 'HH:mm')}</div>
              </Link>
            </React.Fragment>
          ))}
        </div>
      </DropdownMenu>
    </div>
  );
}
