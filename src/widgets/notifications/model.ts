import {attach} from 'effector';

import {$notifications} from '~/entities/wallet';
import {notificationsApiClient} from '~/shared/api/roketo-client';

export const markAllReadFx = attach({
  source: $notifications,
  async effect(notifications) {
    if (notifications.length !== 0) {
      await notificationsApiClient.markAllRead();
    }
  },
});
