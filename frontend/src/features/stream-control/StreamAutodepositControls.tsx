import React from 'react';
import classNames from 'classnames';

import { DropdownOpener } from 'shared/kit/DropdownOpener';
import { DropdownMenu, DropdownMenuItem } from 'shared/kit/DropdownMenu';
import { useBool } from 'shared/hooks/useBool';
import { PauseIcon } from 'shared/icons/Pause';
import { StartIcon } from 'shared/icons/Start';
import { useRoketoContext } from 'app/roketo-context';
import { STREAM_STATUS } from 'shared/api/roketo/constants';
import { RoketoStream } from 'shared/api/roketo/interfaces/entities';

import { useStreamControl } from './useStreamControl';
import { StreamAutodepositStatus } from './StreamAutodepositStatus';

type StreamAutodepositControlsProps = {
  stream: RoketoStream;
  minimal?: boolean;
  className?: string;
  disableMsg?: string;
  enableMsg?: string;
};

export function StreamAutodepositControls({
  stream,
  minimal = false,
  className,
  disableMsg,
  enableMsg,
}: StreamAutodepositControlsProps) {
  const { auth } = useRoketoContext();
  const isOutgoing = auth.accountId === stream.owner_id;
  const isIncoming = auth.accountId === stream.receiver_id;
  const isExternalStream = !isOutgoing && !isIncoming;

  const isDead = stream.status === STREAM_STATUS.INTERRUPTED
    || stream.status === STREAM_STATUS.FINISHED;
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
        {stream.auto_deposit_enabled ? (
          <DropdownMenuItem>
            <button
              type="button"
              className="inline-flex items-center font-semibold w-full"
              onClick={controls.disable}
            >
              <PauseIcon className="mr-4 flex-shrink-0" />
              <span>Disable</span>
            </button>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem>
            <button
              type="button"
              className="inline-flex items-center font-semibold w-full"
              onClick={controls.enable}
            >
              <StartIcon className="mr-4 flex-shrink-0" />
              <span>Enable</span>
            </button>
          </DropdownMenuItem>
        )}
      </DropdownMenu>
    </div>
  );
}
