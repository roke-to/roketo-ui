import { useCallback } from 'react';
import classNames from 'classnames';

import { Button } from 'shared/kit/Button';
import { notificationsApiClient, useNotifications } from 'shared/api/roketo-web';

import styles from './index.module.scss';

export function NotificationsPage() {
  const notificationsSWR = useNotifications();

  const markAsRead = useCallback((id: string) => {
    if (!notificationsSWR.data) {
      return;
    }

    notificationsSWR.mutate(
      async (notifications) => {
        const readNotification = await notificationsApiClient.markRead(id, { isRead: true });

        return notifications?.map(
          (notification) => notification.id === id ? readNotification : notification
        );
      },
      {
        revalidate: false,
        optimisticData: notificationsSWR.data.map(
          (notification) => notification.id === id ? { ...notification, isRead: true } : notification
        )
      }
    );
  }, [notificationsSWR]);

  return (
    <div className="container mx-auto p-12">
      <div className="mb-10">
        <h1 className="text-3xl">Notifications</h1>
      </div>

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

      {notificationsSWR.data?.map((notification) => (
        <div
          key={notification.id}
          className={classNames(
            'grid grid-cols-12 p-10 bg-input rounded-3xl mb-4',
            notification.isRead ? '' : styles.unread
          )}
        >
          <div className="xl:col-span-10">
            {JSON.stringify(notification)}
          </div>
          <div className="flex xl:justify-end xl:col-span-2 items-center">
            {!notification.isRead &&
              <Button
                type="button"
                className="ml-3"
                variant="filled"
                onClick={() => markAsRead(notification.id)}
              >
                Mark as read
              </Button>
            }
          </div>
        </div>
      ))}
    </div>
  );
}
