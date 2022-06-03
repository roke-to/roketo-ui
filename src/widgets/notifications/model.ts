import {attach} from 'effector';
import {notificationsApiClient} from '~/shared/api/roketo-client';
import {$notifications} from '~/services/wallet';

export const markAllReadFx = attach({
  source: $notifications,
  async effect(notifications) {
    if (notifications.length !== 0) {
      await notificationsApiClient.markAllRead();
    }
  },
});
