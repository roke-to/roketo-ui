import {Notification} from '@roketo/api-client';
import {createEffect, sample} from 'effector';

import {notificationsApiClient} from '~/shared/api/roketo-client';

import {retry} from '../lib/retry';
import {$accountId, resetOnLogout} from './account';

const KNOWN_NOTIFICATION_TYPES = new Set([
  'StreamStarted',
  'StreamPaused',
  'StreamFinished',
  'StreamIsDue',
  'StreamContinued',
  'StreamCliffPassed',
  'StreamFundsAdded',
]);

export const $notifications = resetOnLogout.createStore<Notification[] | null>(null);

const notificationsUpdateTimerFx = createEffect(
  () =>
    new Promise<void>((rs) => {
      setTimeout(rs, 5000);
    }),
);
const getNotificationsFx = createEffect(async () =>
  retry(async () => {
    const allNotifications = await notificationsApiClient.findAll();

    return allNotifications.filter((notification) =>
      KNOWN_NOTIFICATION_TYPES.has(notification.type),
    );
  }),
);

sample({
  clock: $accountId,
  filter: Boolean,
  target: getNotificationsFx,
});

sample({
  clock: getNotificationsFx.doneData,
  target: $notifications,
});

sample({
  clock: getNotificationsFx.done,
  target: notificationsUpdateTimerFx,
});

sample({
  clock: notificationsUpdateTimerFx.done,
  target: getNotificationsFx,
});

/** clear notifications when there is no account id */
sample({
  clock: $accountId,
  filter: (id: string | null): id is null => !id,
  fn: () => [],
  target: $notifications,
});
