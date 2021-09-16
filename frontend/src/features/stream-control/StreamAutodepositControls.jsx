import React from 'react';
import {useStreamControl} from './useStreamControl';
import {useNear} from '../near-connect/useNear';
import {
  Button,
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
  const controls = useStreamControl(stream.stream_id);
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
    <div className={classNames(className, 'twind-relative twind-inline-flex')}>
      <DropdownOpener
        minimal={minimal}
        opened={opened}
        onClick={menu.toggle}
        className="twind-flex-grow"
      >
        <StreamAutodepositStatus
          stream={stream}
          enableMsg={enableMsg}
          disableMsg={disableMsg}
        />
      </DropdownOpener>
      <DropdownMenu opened={opened} className="twind-top-full twind-w-44">
        {stream.auto_deposit_enabled ? (
          <DropdownMenuItem>
            <button
              className="twind-inline-flex twind-items-center twind-font-semibold twind-w-full"
              onClick={controls.disable}
            >
              <Pause className="twind-mr-4 twind-flex-shrink-0" />
              <span>Disable</span>
            </button>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem>
            <button
              className="twind-inline-flex twind-items-center twind-font-semibold twind-w-full"
              onClick={controls.enable}
            >
              <Start className="twind-mr-4 twind-flex-shrink-0" />
              <span>Enable</span>
            </button>
          </DropdownMenuItem>
        )}
      </DropdownMenu>
    </div>
  );
}
