import {$roketoWallet} from '~/entities/wallet';

import {
  pauseStream as pauseStreamFn,
  startStream as startStreamFn,
  stopStream as stopStreamFn,
} from '~/shared/api/methods';
import {createProtectedEffect} from '~/shared/lib/protectedEffect';

const modifyStreamFx = createProtectedEffect({
  source: $roketoWallet,
  async fn(
    {contract},
    {command, streamId}: {command: 'start' | 'stop' | 'pause'; streamId: string},
  ) {
    switch (command) {
      case 'start':
        return startStreamFn({contract, streamId});
      case 'pause':
        return pauseStreamFn({contract, streamId});
      case 'stop':
        return stopStreamFn({contract, streamId});
      default:
        return null;
    }
  },
});

export const $loading = modifyStreamFx.pending;
export const startStream = modifyStreamFx.prepend((streamId: string) => ({
  streamId,
  command: 'start',
}));
export const pauseStream = modifyStreamFx.prepend((streamId: string) => ({
  streamId,
  command: 'pause',
}));
export const stopStream = modifyStreamFx.prepend((streamId: string) => ({
  streamId,
  command: 'stop',
}));
