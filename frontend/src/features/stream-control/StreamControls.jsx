import React, {useState} from 'react';
import {useStreamControl} from './useStreamControl';
import {useNear} from '../near-connect/useNear';
import {
  DropdownOpener,
  DropdownMenu,
  DropdownMenuDivider,
  DropdownMenuItem,
} from '../../components/kit';
import {StreamStatus} from './StreamStatus';
import {STREAM_STATUS} from './lib';
import {Stop, Pause, Start} from '../../components/icons';
import classNames from 'classnames';

export function StreamControls({stream, minimal, className}) {
  const near = useNear();
  const isOutgoing = near.near.accountId === stream.owner_id;
  const isDead =
    stream.status === STREAM_STATUS.INTERRUPTED ||
    stream.status === STREAM_STATUS.FINISHED;
  const [menuOpened, setMenuOpened] = useState(false);

  const controls = useStreamControl(stream.stream_id);

  if (controls.loading) {
    return <span>Loading!</span>;
  }

  if (isDead) {
    return <StreamStatus stream={stream} />;
  }

  return (
    <div className={classNames(className, 'twind-relative twind-inline-flex')}>
      <DropdownOpener
        minimal={minimal}
        opened={menuOpened}
        onClick={() => setMenuOpened(!menuOpened)}
      >
        <StreamStatus stream={stream} />
      </DropdownOpener>
      <DropdownMenu opened={menuOpened} className="twind-top-full twind-w-44">
        {stream.status !== STREAM_STATUS.ACTIVE && isOutgoing ? (
          <>
            <DropdownMenuItem>
              <button
                className="twind-inline-flex twind-items-center twind-font-semibold"
                onClick={controls.restart}
              >
                <Start className="twind-mr-4 twind-flex-shrink-0" />
                <span>Start stream </span>{' '}
              </button>
            </DropdownMenuItem>
            <DropdownMenuDivider />
          </>
        ) : null}
        {stream.status !== STREAM_STATUS.PAUSED ? (
          <>
            <DropdownMenuItem>
              <button
                className="twind-inline-flex twind-items-center twind-font-semibold"
                onClick={controls.pause}
              >
                <Pause className="twind-mr-4 twind-flex-shrink-0" />
                <span>Pause stream</span>
              </button>
            </DropdownMenuItem>
            <DropdownMenuDivider />
          </>
        ) : null}

        <DropdownMenuItem>
          <button
            className="twind-inline-flex twind-items-center twind-font-semibold"
            onClick={controls.stop}
          >
            <Stop className="twind-mr-4 twind-flex-shrink-0" />
            <span> Stop stream </span>
          </button>
        </DropdownMenuItem>
      </DropdownMenu>
    </div>
  );
}
