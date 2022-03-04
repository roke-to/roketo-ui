import React from 'react';
import {useStreamControl} from './useStreamControl';
import {useNear} from '../near-connect/useNear';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownOpener,
} from '../../components/kit';
import {StreamAutodepositStatus} from './StreamAutodepositStatus';
import {STREAM_STATUS} from './lib';
import classNames from 'classnames';
import {useBool} from '../../lib/useBool';
import {Pause, Start} from '../../components/icons';

export function StreamAutodepositControls({
  stream,
  minimal,
  className,
  disableMsg,
  enableMsg,
}) {
  const near = useNear();
  const isOutgoing = near.near.accountId === stream.owner_id;
  const isIncoming = near.near.accountId === stream.receiver_id;
  const isExternalStream = !isOutgoing && !isIncoming;

  const isDead =
    stream.status === STREAM_STATUS.INTERRUPTED ||
    stream.status === STREAM_STATUS.FINISHED;
  const controls = useStreamControl(stream.id);
  const menu = useBool(false);
  const opened = menu.on && !controls.loading;

  if (isDead || isExternalStream) {
    return (
      <StreamAutodepositStatus
        stream={stream}
        enableMsg={enableMsg}
        disableMsg={disableMsg}
      />
    );
  }

  return (
    <div className={classNames(className, 'relative inline-flex')}>
      <DropdownOpener
        minimal={minimal}
        opened={opened}
        onChange={menu.setOn}
        className="flex-grow"
      >
        <StreamAutodepositStatus
          stream={stream}
          enableMsg={enableMsg}
          disableMsg={disableMsg}
        />
      </DropdownOpener>
      <DropdownMenu
        opened={opened}
        className="top-full w-44"
        onClose={menu.turnOff}
      >
        {stream.is_auto_deposit_enabled ? (
          <DropdownMenuItem>
            <button
              className="inline-flex items-center font-semibold w-full"
              onClick={controls.disable}
            >
              <Pause className="mr-4 flex-shrink-0" />
              <span>Disable</span>
            </button>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem>
            <button
              className="inline-flex items-center font-semibold w-full"
              onClick={controls.enable}
            >
              <Start className="mr-4 flex-shrink-0" />
              <span>Enable</span>
            </button>
          </DropdownMenuItem>
        )}
      </DropdownMenu>
    </div>
  );
}
