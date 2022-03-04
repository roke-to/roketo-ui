import React, {useState} from 'react';
import {useStreamControl} from './useStreamControl';
import {useNear} from '../near-connect/useNear';
import {DropdownOpener} from '../../components/kit/DropdownOpener';
import {DropdownMenu, DropdownMenuDivider, DropdownMenuItem} from '../../components/kit/DropdownMenu';
import {Button} from '../../components/kit/Button';
import {StreamStatus} from './StreamStatus';
import {STREAM_STATUS} from './lib';
import {useBool} from '../../lib/useBool';
import {PauseIcon} from '../../components/icons/Pause';
import {StartIcon} from '../../components/icons/Start';
import {StopIcon} from '../../components/icons/Stop';
import classNames from 'classnames';
import Modal from 'react-modal';

function PauseConfirmModal({modalControl, onConfirm}) {
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
export function StreamControls({stream, minimal, className}) {
  const near = useNear();
  const modalControl = useBool(false);

  const isOutgoing = near.near.accountId === stream.owner_id;
  const isIncoming = near.near.accountId === stream.receiver_id;
  const isExternalStream = !isOutgoing && !isIncoming;

  const isDead =
    stream.status === STREAM_STATUS.INTERRUPTED ||
    stream.status === STREAM_STATUS.FINISHED;
  const [menuOpened, setMenuOpened] = useState(false);

  const controls = useStreamControl(stream.id);

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
      controls.pause();
    }
  }

  const opened = menuOpened && !controls.loading;

  return (
    <div className={classNames(className, 'relative inline-flex')}>
      <PauseConfirmModal
        modalControl={modalControl}
        onConfirm={controls.pause}
      />
      <DropdownOpener
        minimal={minimal}
        opened={opened}
        onChange={setMenuOpened}
      >
        {controls.loading ? 'Loading...' : <StreamStatus stream={stream} />}
      </DropdownOpener>
      <DropdownMenu
        onClose={() => setMenuOpened(false)}
        opened={opened}
        className="top-full w-44"
      >
        {stream.status !== STREAM_STATUS.ACTIVE && isOutgoing ? (
          <>
            <DropdownMenuItem>
              <button
                className="inline-flex items-center font-semibold"
                onClick={controls.restart}
              >
                <StartIcon className="mr-4 flex-shrink-0" />
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
                className="inline-flex items-center font-semibold"
                onClick={onClickPause}
              >
                <PauseIcon className="mr-4 flex-shrink-0" />
                <span>Pause stream</span>
              </button>
            </DropdownMenuItem>
            <DropdownMenuDivider />
          </>
        ) : null}

        <DropdownMenuItem>
          <button
            className="inline-flex items-center font-semibold"
            onClick={controls.stop}
          >
            <StopIcon className="mr-4 flex-shrink-0" />
            <span> Stop stream </span>
          </button>
        </DropdownMenuItem>
      </DropdownMenu>
    </div>
  );
}
