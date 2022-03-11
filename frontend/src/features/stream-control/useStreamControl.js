import React from 'react';
import { useRoketoContext } from 'app/roketo-context';

const STREAM_CONTROL_ID_NOT_PROVIDED = new Error(
  'Provide stream id to use stream methods',
);

export function useStreamControl(streamId) {
  const ensureMethodHasStreamId = () => {
    if (!streamId) throw STREAM_CONTROL_ID_NOT_PROVIDED;
  };
  const { roketo } = useRoketoContext();
  const [loading, setLoading] = React.useState(false);

  async function updateAllAndWithdraw({ tokensWithoutStorage = 0 }) {
    console.debug('updating all account');
    await roketo.api.updateAccount({ tokensWithoutStorage });
    console.debug('update completed');
  }

  async function enable() {
    ensureMethodHasStreamId();
    console.debug('enable', streamId);

    await roketo.api.changeAutoDeposit({
      streamId,
      autoDeposit: true,
    });
  }

  async function disable() {
    ensureMethodHasStreamId();
    console.debug('disabling', streamId);

    await roketo.api.changeAutoDeposit({
      streamId,
      autoDeposit: false,
    });
  }

  async function depositFunc({ token, deposit }) {
    ensureMethodHasStreamId();
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
    ensureMethodHasStreamId();
    console.debug('pausing', streamId);
    const res = await roketo.api.pauseStream({
      streamId,
    });
    console.debug('pausing res', res);

    return res;
  }

  async function restart() {
    ensureMethodHasStreamId();
    console.debug('restarting', streamId);
    const res = await roketo.api.startStream({ streamId });
    console.debug('restarting res', res);

    return res;
  }

  async function stop() {
    ensureMethodHasStreamId();
    console.debug('Stop called stopping', streamId);
    const res = await roketo.api.stopStream({ streamId });
    console.debug('stopping res', res);
    return res;
  }

  function wrapped(fn) {
    return async (...args) => {
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
    enable: wrapped(enable),
    disable: wrapped(disable),
  };
}
