import {format, isToday, isYesterday} from 'date-fns';
import {attach, createEvent, createStore, sample} from 'effector';
import {generatePath} from 'react-router-dom';

import {$notifications} from '~/entities/wallet';

import {ecoApi} from '~/shared/api/eco';
import {ROUTES_MAP} from '~/shared/lib/routing';

export const $panelIsVisible = createStore(false);
export const setPanelVisibility = createEvent<boolean>();
export const closePanel = setPanelVisibility.prepend<any>(() => false);
export const $notificationsContent = $notifications.map(
  (items) =>
    items?.map((notification) => {
      // eslint-disable-next-line no-nested-ternary
      const createdDate = new Date(notification.createdAt);
      const dateText = isToday(createdDate)
        ? ''
        : isYesterday(createdDate)
        ? 'Yesterday'
        : format(createdDate, 'PP');
      const timeText = format(createdDate, 'HH:mm');
      return {
        notification,
        link: generatePath(ROUTES_MAP.stream.path, {
          id: notification.payload.stream.id,
        }),
        dateTime: `${dateText} ${timeText}`,
      };
    }) ?? [],
);
export const $hasUnreadNotifications = $notifications.map(
  (items) => items?.some(({isRead}) => !isRead) ?? false,
);

const markAllReadFx = attach({
  source: $notifications,
  async effect(notifications) {
    if (notifications) {
      await ecoApi.notifications.markAllRead();
    }
  },
});

sample({
  clock: setPanelVisibility,
  filter: (visible) => !visible,
  target: markAllReadFx,
});

sample({
  clock: setPanelVisibility,
  target: $panelIsVisible,
});

$notifications.on(setPanelVisibility, (notifications, visible) => {
  if (!visible) {
    return (
      notifications?.map((notification) =>
        notification.isRead ? notification : {...notification, isRead: true},
      ) ?? []
    );
  }
});
