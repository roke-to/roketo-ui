import React from 'react';
import { useNear } from '../near-connect/useNear';

export function useStreamControl(streamId) {
  const near = useNear();
  const [loading, setLoading] = React.useState(false);

  async function pause(output) {
    console.log('pausing', output);
    const res = await near.near.contract.pause_stream(
      { stream_id: streamId },
      '200000000000000',
      1,
    );
    console.log('pausing res', res);

    return res;
  }

  async function restart(output) {
    console.log('restarting', output);
    const res = await near.near.contract.restart_stream(
      { stream_id: streamId },
      '200000000000000',
      1,
    );
    console.log('restarting res', res);

    return res;
  }

  async function stop(output) {
    console.log('stopping', output);
    const res = await near.near.contract.stop_stream(
      { stream_id: streamId },
      '200000000000000',
      1,
    );
    console.log('stopping res', res);
    return res;
  }

  function wrapped(fn) {
    return (...args) => {
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
  };
}
