import React from 'react';
import {useNear} from '../near-connect/useNear';

const STREAM_CONTROL_ID_NOT_PROVIDED = new Error(
  'Provide stream id to use stream methods',
);

export function useStreamControl(streamId) {
  const ensureMethodHasStreamId = () => {
    if (!streamId) throw STREAM_CONTROL_ID_NOT_PROVIDED;
  };
  const near = useNear();
  const [loading, setLoading] = React.useState(false);

  async function updateAllAndWithdraw({tokensWithoutStorage = 0}) {
    console.debug('updating all account');
    await near.contractApi.updateAccount({tokensWithoutStorage});
    console.debug('update completed');
  }

  async function enable() {
    ensureMethodHasStreamId();
    console.debug('enable', streamId);
    
    await near.contractApi.changeAutoDeposit({
      streamId,
      autoDeposit: true,
    });
  }

  async function disable() {
    ensureMethodHasStreamId();
    console.debug('disabling', streamId);
    
    await near.contractApi.changeAutoDeposit({
      streamId,
      autoDeposit: false,
    });
  }

  async function deposit({token, deposit}) {
    ensureMethodHasStreamId();
    console.debug('depositing', token, streamId);

    await near.contractApi.depositStream({
      token,
      deposit,
      streamId,
    });
    // token === 'NEAR'
    //   ? await near.contractApi.depositStream({
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
    const res = await near.contractApi.pauseStream({
      streamId,
    });
    console.debug('pausing res', res);

    return res;
  }

  async function restart() {
    ensureMethodHasStreamId();
    console.debug('restarting', streamId);
    const res = await near.contractApi.startStream({streamId: streamId});
    console.debug('restarting res', res);

    return res;
  }

  async function stop() {
    ensureMethodHasStreamId();
    console.debug('Stop called stopping', streamId);
    const res = await near.contractApi.stopStream({streamId: streamId});
    console.debug('stopping res', res);
    return res;
  }

  function wrapped(fn) {
    return async (...args) => {
      if (loading) return;

      setLoading(true);

      try {
        return await fn(...args);
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
    deposit: wrapped(deposit),
    enable: wrapped(enable),
    disable: wrapped(disable),
  };
}
