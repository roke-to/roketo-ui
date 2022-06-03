import {attach} from 'effector';

import {$roketoWallet} from 'services/wallet';

const modifyStreamFx = attach({
  source: $roketoWallet,
  async effect(
    wallet,
    {
      command,
      streamId,
    }: {command: 'start' | 'stop' | 'pause'; streamId: string},
  ) {
    if (!wallet) return null;
    switch (command) {
      case 'start':
        return wallet.roketo.api.startStream({streamId});
      case 'pause':
        return wallet.roketo.api.pauseStream({streamId});
      case 'stop':
        return wallet.roketo.api.stopStream({streamId});
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
