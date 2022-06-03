import { useState, ReactNode } from 'react';
import classNames from 'classnames';
import {useStore, useStoreMap} from 'effector-react';
import Modal from 'react-modal';

import { STREAM_STATUS } from '~/shared/api/roketo/constants';
import { testIds } from '~/shared/constants';
import {$accountId} from '~/services/wallet';

import { DropdownOpener } from '~/shared/kit/DropdownOpener';
import { DropdownMenu, DropdownMenuDivider, DropdownMenuItem } from '~/shared/kit/DropdownMenu';
import { useBool, BooleanControl } from '~/shared/hooks/useBool';
import type { RoketoStream } from '~/shared/api/roketo/interfaces/entities';
import { isActiveStream, isWithCliff, isDead, isLocked, isPausedStream } from '~/shared/api/roketo/helpers';

import { StreamStatus } from '../StreamStatus';
import {$loading, startStream, pauseStream, stopStream} from './model';

import { StartIcon } from './StartIcon';
import { PauseIcon } from './PauseIcon';
import { StopIcon } from './StopIcon';
import styles from './styles.module.scss';

function ConfirmModal({modalControl, onConfirm, header, buttonText, className, children}: {
  modalControl: BooleanControl;
  onConfirm: () => void;
  header: ReactNode;
  buttonText: ReactNode
  children: ReactNode;
  className: string
}) {
  return (
    <Modal
      isOpen={modalControl.on}
      onRequestClose={modalControl.turnOff}
      className={styles.modalContent}
      overlayClassName={styles.modalOverlay}
    >
      <h2 className={styles.modalHeader}>{header}</h2>
      <p>
        {children}
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
          className={classNames(styles.modalButton, className)}
        >
          {buttonText}
        </button>
      </div>
    </Modal>
  );
}

export function StreamControls({ stream, className }: {
  stream: RoketoStream;
  className?: string;
}) {
  const pauseModalControl = useBool(false);
  const stopModalControl = useBool(false);
  const loading = useStore($loading)
  const [menuOpened, setMenuOpened] = useState(false);
  const {isOutgoing, isIncoming, isExternal} = useStoreMap({
    store: $accountId,
    keys: [stream],
    fn(accountId) {
      const outgoing = accountId === stream.owner_id;
      const incoming = accountId === stream.receiver_id;
      const external = !outgoing && !incoming;
      return {isOutgoing: outgoing, isIncoming: incoming, isExternal: external}
    }
  })

  if (isDead(stream) || isExternal) {
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
      pauseStream(stream.id);
    }
  }

  const onClickStop = () => {
    setMenuOpened(false);
    stopModalControl.turnOn();
  }

  const opened = menuOpened && !loading;

  const shouldShowStartButton = stream.status !== STREAM_STATUS.Active && isOutgoing;
  const shouldShowPauseButton = stream.status === STREAM_STATUS.Active && !isWithCliff(stream);

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
      <ConfirmModal
        modalControl={pauseModalControl}
        onConfirm={() => pauseStream(stream.id)}
        header="Are you sure?"
        buttonText="Pause"
        className={styles.modalWarning}
      >
        As a stream receiver, you will not be able to resume stream. Only stream
        owners can resume streams.
      </ConfirmModal>
      <ConfirmModal
        modalControl={stopModalControl}
        onConfirm={() => stopStream(stream.id)}
        header="Stop stream"
        buttonText="Stop"
        className={styles.modalDanger}
      >
        This action will completely shut down the stream. After that, it can't be turned on.
      </ConfirmModal>
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
              onClick={() => startStream(stream.id)}
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
