import React from 'react';
import { useStreamControl } from './useStreamControl';

export function StreamControls({ output }) {
  const controls = useStreamControl(output.stream_id);

  if (controls.loading) {
    // TODO: cool loader
    return <span>Loading!</span>;
  }

  return output.status === 'ACTIVE' || output.status === 'PAUSED' ? (
    <div className="d-flex flex-row">
      <div>
        {output.status === 'ACTIVE' ? (
          <button
            type="button"
            className="btn btn-warning btn-sm m-1"
            onClick={controls.pause}
          >
            Pause
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-warning btn-sm m-1"
            onClick={controls.restart}
          >
            Restart
          </button>
        )}
      </div>
      <button
        type="button"
        className="btn btn-danger btn-sm m-1"
        onClick={controls.stop}
      >
        Stop
      </button>
    </div>
  ) : (
    <div />
  );
}
