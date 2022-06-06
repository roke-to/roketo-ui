import {attach, createEvent, sample} from 'effector';

import {$notifications} from '~/entities/wallet';

import {notificationsApiClient} from '~/shared/api/roketo-client';

export const dropdownClosed = createEvent();

const markAllReadFx = attach({
  source: $notifications,
  async effect(notifications) {
    if (notifications.length !== 0) {
      await notificationsApiClient.markAllRead();
    }
  },
});

sample({
  clock: dropdownClosed,
  target: markAllReadFx,
});

$notifications.on(dropdownClosed, (notifications) =>
  notifications.map((notification) =>
    notification.isRead ? notification : {...notification, isRead: true},
  ),
);
