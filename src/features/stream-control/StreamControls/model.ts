import {
  pauseStream as pauseStreamFn,
  startStream as startStreamFn,
  stopStream as stopStreamFn,
} from '@roketo/sdk';
import {combine} from 'effector';

import {$nearWallet, $roketoWallet} from '~/entities/wallet';

import {env} from '~/shared/config';
import {createProtectedEffect} from '~/shared/lib/protectedEffect';

const modifyStreamFx = createProtectedEffect({
  source: combine($roketoWallet, $nearWallet, (roketo, near) =>
    !!roketo && !!near ? {roketo, near} : null,
  ),
  async fn(
    {roketo: {transactionMediator}, near: {auth}},
    {command, streamId}: {command: 'start' | 'stop' | 'pause'; streamId: string},
  ) {
    const creator = () => {
      switch (command) {
        case 'start':
          return startStreamFn({
            streamId,
            transactionMediator,
            roketoContractName: env.ROKETO_CONTRACT_NAME,
          });
        case 'pause':
          return pauseStreamFn({
            streamId,
            transactionMediator,
            roketoContractName: env.ROKETO_CONTRACT_NAME,
          });
        case 'stop':
          return stopStreamFn({
            streamId,
            transactionMediator,
            roketoContractName: env.ROKETO_CONTRACT_NAME,
          });
        default:
          return null;
      }
    };
    try {
      await creator();
    } catch (error) {
      if ((error as Error).message === 'Wallet not signed in') {
        await auth.login();
        await creator();
      } else {
        throw error;
      }
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

modifyStreamFx.finally.watch((upd) => {
  console.log('modifyStreamFx', upd);
});
