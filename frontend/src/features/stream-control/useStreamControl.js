import React from 'react';
import {useNear} from '../near-connect/useNear';

export function useStreamControl(streamId) {
  const near = useNear();
  const [loading, setLoading] = React.useState(false);

  async function deposit({deposit}) {
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
    console.log('pausing', streamId);
    const res = await near.contractApi.pauseStream({
      streamId,
    });
    console.log('pausing res', res);

    return res;
  }

  async function restart() {
    console.log('restarting', streamId);
    const res = await near.contractApi.startStream({streamId: streamId});
    console.log('restarting res', res);

    return res;
  }

  async function stop() {
    console.log('Stop called stopping', streamId);
    const res = await near.contractApi.stopStream({streamId: streamId});
    console.log('stopping res', res);
    return res;
  }

  function wrapped(fn) {
    return (...args) => {
      console.log('wrapped', ...args);
      if (loading) return;

      setLoading(true);

      try {
        return fn(...args);
      } finally {
        setLoading(false);
      }
    };
  }
  return {
    loading,
    pause: wrapped(pause),
    restart: wrapped(restart),
    stop: wrapped(stop),
    deposit: wrapped(deposit),
    deposit_ft: wrapped(deposit_ft),
  };
}
