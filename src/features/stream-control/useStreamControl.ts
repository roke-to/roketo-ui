import React from 'react';
import { useRoketoContext } from 'app/roketo-context';

function assertMethodHasStreamId(streamId?: string): asserts streamId {
  console.assert(streamId, 'Provide stream id to use stream methods');
}

export function useStreamControl(streamId?: string) {
  const { roketo } = useRoketoContext();
  const [loading, setLoading] = React.useState(false);

  async function updateAllAndWithdraw({ tokensWithoutStorage = 0 }) {
    console.debug('updating all account');
    await roketo.api.updateAccount({ tokensWithoutStorage });
    console.debug('update completed');
  }

  async function depositFunc({ token, deposit }: { token: string, deposit: string }) {
    assertMethodHasStreamId(streamId);
    console.debug('depositing', token, streamId);

    await roketo.api.depositStream({
      token,
      deposit,
      streamId,
    });
    // token === 'NEAR'
    //   ? await roketo.api.depositStream({
    //       streamId,
    //       deposit,
    //     })
    //   : await near.near.fts[token].ft_transfer_call(
    //       {
    //         receiver_id: near.near.contractName,
    //         amount: deposit,
    //         memo: 'xyiming transfer',
    //         msg: streamId,
    //       },
    //       '200000000000000',
    //       1,
    //     );
  }

  async function pause() {
    assertMethodHasStreamId(streamId);
    console.debug('pausing', streamId);
    const res = await roketo.api.pauseStream({
      streamId,
    });
    console.debug('pausing res', res);
  }

  async function restart() {
    assertMethodHasStreamId(streamId);
    console.debug('restarting', streamId);
    const res = await roketo.api.startStream({ streamId });
    console.debug('restarting res', res);
  }

  async function stop() {
    assertMethodHasStreamId(streamId);
    console.debug('Stop called stopping', streamId);
    const res = await roketo.api.stopStream({ streamId });
    console.debug('stopping res', res);
  }

  function wrapped<T extends any[]>(fn: (...args: T) => Promise<void>) {
    return async (...args: T) => {
      if (loading) return;

      setLoading(true);

      try {
        await fn(...args);
      } finally {
        setLoading(false);
      }
    };
  }

  return {
    loading,
    updateAllAndWithdraw: wrapped(updateAllAndWithdraw),
    pause: wrapped(pause),
    restart: wrapped(restart),
    stop: wrapped(stop),
    deposit: wrapped(depositFunc),
  };
}
