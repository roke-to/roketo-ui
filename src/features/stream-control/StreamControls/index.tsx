import React, { useState } from 'react';
import classNames from 'classnames';
import Modal from 'react-modal';

import { DropdownOpener } from 'shared/kit/DropdownOpener';
import { DropdownMenu, DropdownMenuDivider, DropdownMenuItem } from 'shared/kit/DropdownMenu';
import { useBool, BooleanControl } from 'shared/hooks/useBool';
import { useRoketoContext } from 'app/roketo-context';
import type { RoketoStream } from 'shared/api/roketo/interfaces/entities';
import { isActiveStream, isDead, isLocked, isPausedStream } from 'shared/api/roketo/helpers';

import { STREAM_STATUS } from 'shared/api/roketo/constants';
import { testIds } from 'shared/constants';

import { StreamStatus } from '../StreamStatus';

import styles from './styles.module.scss';
import { StartIcon } from './StartIcon';
import { PauseIcon } from './PauseIcon';
import { StopIcon } from './StopIcon';

type ConfirmModalProps = {
  modalControl: BooleanControl;
  onConfirm: () => void;
};

function PauseConfirmModal({ modalControl, onConfirm }: ConfirmModalProps) {
  return (
    <Modal
      isOpen={modalControl.on}
      onRequestClose={modalControl.turnOff}
      className={styles.modalContent}
      overlayClassName={styles.modalOverlay}
    >
      <h2 className={styles.modalHeader}>Are you sure?</h2>
      <p>
        As a stream receiver, you will not be able to resume stream. Only stream
        owners can resume streams.
      </p>
      <div className={styles.modalButtons}>
        <button
          type="button"
          onClick={modalControl.turnOff}
          className={classNames(styles.modalButton, styles.modalSecondary)}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => {
            modalControl.turnOff();
            onConfirm();
          }}
          className={classNames(styles.modalButton, styles.modalWarning)}
        >
          Pause
        </button>
      </div>
    </Modal>
  );
}

function StopConfirmModal({ modalControl, onConfirm }: ConfirmModalProps) {
  return (
    <Modal
      isOpen={modalControl.on}
      onRequestClose={modalControl.turnOff}
      className={styles.modalContent}
      overlayClassName={styles.modalOverlay}
    >
      <h2 className={styles.modalHeader}>Stop stream</h2>
      <p>
        This action will completely shut down the stream. After that, it can't be turned on.
      </p>
      <div className={styles.modalButtons}>
        <button
          type="button"
          onClick={modalControl.turnOff}
          className={classNames(styles.modalButton, styles.modalSecondary)}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => {
            modalControl.turnOff();
            onConfirm();
          }}
          className={classNames(styles.modalButton, styles.modalDanger)}
        >
          Stop
        </button>
      </div>
    </Modal>
  );
}

type StreamControlsProps = {
  stream: RoketoStream;
  className?: string;
};

export function StreamControls({ stream, className }: StreamControlsProps) {
  const { auth, roketo } = useRoketoContext();
  const pauseModalControl = useBool(false);
  const stopModalControl = useBool(false);
  const [loading, setLoading] = useState(false);
  const [menuOpened, setMenuOpened] = useState(false);

  const isOutgoing = auth.accountId === stream.owner_id;
  const isIncoming = auth.accountId === stream.receiver_id;
  const isExternalStream = !isOutgoing && !isIncoming;

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

  if (isDead(stream) || isExternalStream) {
    return (
      <StreamStatus
        className={className}
        stream={stream}
      />
    );
  }

  const onClickPause = () => {
    setMenuOpened(false);
    if (isIncoming) {
      pauseModalControl.turnOn();
    } else {
      handlePause();
    }
  }

  const onClickStop = () => {
    setMenuOpened(false);
    stopModalControl.turnOn();
  }

  const opened = menuOpened && !loading;

  const shouldShowStartButton = stream.status !== STREAM_STATUS.Active && isOutgoing;
  const shouldShowPauseButton = stream.status === STREAM_STATUS.Active;

  const statusClassName = {
    [styles.active]: isActiveStream(stream),
    [styles.pause]: isPausedStream(stream),
    [styles.stop]: isDead(stream),
  };

  if (isLocked(stream)) {
    return (
      <div className={classNames(styles.relative, className)}>
        <button
          type="button"
          className={classNames(styles.dropdownOpener, styles.notAllowed)}
        >
          <StreamStatus
            stream={stream}
          />
        </button>
      </div>
    );
  }

  return (
    <div className={classNames(styles.relative, className)}>
      <PauseConfirmModal
        modalControl={pauseModalControl}
        onConfirm={handlePause}
      />

      <StopConfirmModal
        modalControl={stopModalControl}
        onConfirm={handleStop}
      />

      <DropdownOpener
        opened={opened}
        onChange={setMenuOpened}
        className={classNames(styles.dropdownOpener, statusClassName)}
        testId={testIds.streamControlsDropdown}
      >
        {loading ? 'Loading...' : <StreamStatus stream={stream} className={styles.statusPadded} />}
      </DropdownOpener>

      <DropdownMenu
        onClose={() => setMenuOpened(false)}
        opened={opened}
        className={styles.controlsMenu}
      >
        {shouldShowStartButton && (
          <DropdownMenuItem>
            <button
              type="button"
              onClick={handleStart}
              className={classNames(styles.controlButton, styles.start)}
              data-testid={testIds.streamStartButton}
            >
              <StartIcon />
              <span>Start</span>
              {' '}
            </button>
          </DropdownMenuItem>
        )}

        {shouldShowPauseButton && (
          <DropdownMenuItem>
            <button
              type="button"
              onClick={onClickPause}
              className={classNames(styles.controlButton, styles.pause)}
              data-testid={testIds.streamPauseButton}
            >
              <PauseIcon />
              <span>Pause</span>
            </button>
          </DropdownMenuItem>
        )}

        {(shouldShowStartButton || shouldShowPauseButton) &&
          <DropdownMenuDivider />
        }
        <DropdownMenuItem>
          <button
            type="button"
            onClick={onClickStop}
            className={classNames(styles.controlButton, styles.stop)}
            data-testid={testIds.streamStopButton}
          >
            <StopIcon />
            <span>Stop</span>
          </button>
        </DropdownMenuItem>
      </DropdownMenu>
    </div>
  );
}
