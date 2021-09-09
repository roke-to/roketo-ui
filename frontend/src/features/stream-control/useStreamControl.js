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

  async function updateAllAndWithdraw() {
    console.log('updating all account');

    await near.contractApi.updateAccount({});
    console.log('update completed');
  }

  async function enable() {
    console.log('enable', streamId);
    // const res = await near.contractApi.enable
  }

  async function disable() {
    ensureMethodHasStreamId();
    console.log('disabling', streamId);
    // const res = await near.contractApi.disable;
  }

  async function deposit({deposit}) {
    ensureMethodHasStreamId();
    console.log('depositing', streamId);
    await near.contractApi.depositStream({
      streamId,
      deposit,
    });
  }

  async function deposit_ft({deposit}) {
    console.log('depositing ft', streamId);
    await near.near.ft.ft_transfer_call(
      {
        receiver_id: near.near.contractName,
        amount: deposit,
        memo: 'xyiming transfer',
        msg: streamId,
      },
      '200000000000000',
      1,
    );
  }

  async function pause() {
    ensureMethodHasStreamId();
    console.log('pausing', streamId);
    const res = await near.contractApi.pauseStream({
      streamId,
    });
    console.log('pausing res', res);

    return res;
  }

  async function restart() {
    ensureMethodHasStreamId();
    console.log('restarting', streamId);
    const res = await near.contractApi.startStream({streamId: streamId});
    console.log('restarting res', res);

    return res;
  }

  async function stop() {
    ensureMethodHasStreamId();
    console.log('Stop called stopping', streamId);
    const res = await near.contractApi.stopStream({streamId: streamId});
    console.log('stopping res', res);
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
    deposit_ft: wrapped(deposit_ft),
    enable: wrapped(enable),
    disable: wrapped(disable)
  };
}
