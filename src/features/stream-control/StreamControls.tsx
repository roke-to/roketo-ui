import React, { useState } from 'react';
import classNames from 'classnames';
import Modal from 'react-modal';

import { DropdownOpener } from 'shared/kit/DropdownOpener';
import { DropdownMenu, DropdownMenuDivider, DropdownMenuItem } from 'shared/kit/DropdownMenu';
import { Button } from 'shared/kit/Button';
import { useBool, BooleanControl } from 'shared/hooks/useBool';
import { PauseIcon } from 'shared/icons/Pause';
import { StartIcon } from 'shared/icons/Start';
import { StopIcon } from 'shared/icons/Stop';
import { useRoketoContext } from 'app/roketo-context';
import type { RoketoStream } from 'shared/api/roketo/interfaces/entities';

import { STREAM_STATUS } from 'shared/api/roketo/constants';
import { StreamStatus } from './StreamStatus';

type PauseConfirmModalProps = {
  modalControl: BooleanControl;
  onConfirm: () => void;
};

function PauseConfirmModal({ modalControl, onConfirm }: PauseConfirmModalProps) {
  return (
    <Modal
      isOpen={modalControl.on}
      onRequestClose={modalControl.turnOff}
      className="ModalContent"
      overlayClassName="ModalOverlay"
    >
      <h2 className="text-2xl mb-4">Are you sure?</h2>
      <p className="mb-6">
        As a stream receiver, you will not be able to resume stream. Only stream
        owners can resume streams
      </p>
      <Button
        className="w-full"
        variant="filled"
        type="button"
        onClick={() => {
          modalControl.turnOff();
          onConfirm();
        }}
      >
        Yes, I want to pause stream.
      </Button>
    </Modal>
  );
}

type StreamControlsProps = {
  stream: RoketoStream;
  minimal?: boolean;
  className: string;
};

export function StreamControls({ stream, minimal = false, className }: StreamControlsProps) {
  const { auth, roketo } = useRoketoContext();
  const modalControl = useBool(false);
  const [loading, setLoading] = useState(false);
  const [menuOpened, setMenuOpened] = useState(false);

  const isOutgoing = auth.accountId === stream.owner_id;
  const isIncoming = auth.accountId === stream.receiver_id;
  const isExternalStream = !isOutgoing && !isIncoming;

  const isDead = stream.status === STREAM_STATUS.Finished;

  const handlePause = async () => {
    setLoading(true);
    await roketo.api.pauseStream({ streamId: stream.id });
    setLoading(false);
  }

  const handleStart = async () => {
    setLoading(true);
    await roketo.api.startStream({ streamId: stream.id });
    setLoading(false);
  }

  const handleStop = async () => {
    setLoading(true);
    await roketo.api.stopStream({ streamId: stream.id });
    setLoading(false);
  }

  if (isDead || isExternalStream) {
    return (
      <StreamStatus
        className={classNames(
          minimal ? '' : 'border border-border p-4 px-6 rounded-lg',
          className,
        )}
        stream={stream}
      />
    );
  }

  function onClickPause() {
    if (isIncoming) {
      modalControl.turnOn();
    } else {
      handlePause();
    }
  }

  const opened = menuOpened && !loading;

  return (
    <div className={classNames(className, 'relative inline-flex')}>
      <PauseConfirmModal
        modalControl={modalControl}
        onConfirm={handlePause}
      />
      <DropdownOpener
        minimal={minimal}
        opened={opened}
        onChange={setMenuOpened}
      >
        {loading ? 'Loading...' : <StreamStatus stream={stream} />}
      </DropdownOpener>
      <DropdownMenu
        onClose={() => setMenuOpened(false)}
        opened={opened}
        className="top-full w-44"
      >
        {stream.status !== STREAM_STATUS.Active && isOutgoing && (
          <>
            <DropdownMenuItem>
              <button
                type="button"
                className="inline-flex items-center font-semibold"
                onClick={handleStart}
              >
                <StartIcon className="mr-4 flex-shrink-0" />
                <span>Start stream</span>
                {' '}
              </button>
            </DropdownMenuItem>
            <DropdownMenuDivider />
          </>
        )}

        {stream.status !== STREAM_STATUS.Paused && (
          <>
            <DropdownMenuItem>
              <button
                type="button"
                className="inline-flex items-center font-semibold"
                onClick={onClickPause}
              >
                <PauseIcon className="mr-4 flex-shrink-0" />
                <span>Pause stream</span>
              </button>
            </DropdownMenuItem>
            <DropdownMenuDivider />
          </>
        )}

        <DropdownMenuItem>
          <button
            type="button"
            className="inline-flex items-center font-semibold"
            onClick={handleStop}
          >
            <StopIcon className="mr-4 flex-shrink-0" />
            <span> Stop stream </span>
          </button>
        </DropdownMenuItem>
      </DropdownMenu>
    </div>
  );
}
