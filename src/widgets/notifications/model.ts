import {attach, createEvent, sample} from 'effector';

import {$notifications} from '~/entities/wallet';

import {notificationsApiClient} from '~/shared/api/roketo-client';

export const markAllRead = createEvent();

const markAllReadFx = attach({
  source: $notifications,
  async effect(notifications) {
    if (notifications.length !== 0) {
      await notificationsApiClient.markAllRead();
    }
  },
});

sample({
  clock: markAllRead,
  target: markAllReadFx,
});

sample({
  clock: markAllRead,
  source: $notifications,
  fn: (notifications) =>
    notifications.map((notification) =>
      notification.isRead ? notification : {...notification, isRead: true},
    ),
  target: $notifications,
});
