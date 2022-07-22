import cn from 'classnames';
import {useGate, useStore, useStoreMap} from 'effector-react';
import {ReactNode, useState} from 'react';
import Modal from 'react-modal';

import {blurGate} from '~/entities/blur';
import {$accountId} from '~/entities/wallet';

import {STREAM_STATUS} from '~/shared/api/roketo/constants';
import type {RoketoStream} from '~/shared/api/roketo/interfaces/entities';
import {
  isActiveStream,
  isDead,
  isPausedStream,
  isWithCliff,
  wasStartedAndLocked,
} from '~/shared/api/roketo/lib';
import {testIds} from '~/shared/constants';
import {BooleanControl, useBool} from '~/shared/hooks/useBool';
import {AdaptiveModal} from '~/shared/kit/AdaptiveModal';
import {DropdownMenuDivider, DropdownMenuItem} from '~/shared/kit/DropdownMenu';
import {DropdownOpener} from '~/shared/kit/DropdownOpener';

import {StreamStatus} from '../StreamStatus';
import {$loading, pauseStream, startStream, stopStream} from './model';
import {PauseIcon} from './PauseIcon';
import {StartIcon} from './StartIcon';
import {StopIcon} from './StopIcon';
import styles from './styles.module.scss';

function ConfirmModal({
  modalControl,
  onConfirm,
  header,
  buttonText,
  className,
  children,
  testId,
  modalName,
}: {
  modalControl: BooleanControl;
  onConfirm: () => void;
  header: ReactNode;
  buttonText: ReactNode;
  children: ReactNode;
  className: string;
  testId?: string;
  modalName: string;
}) {
  useGate(blurGate, {
    modalId: modalName,
    active: modalControl.on,
  });
  return (
    <Modal
      isOpen={modalControl.on}
      onRequestClose={modalControl.turnOff}
      className={styles.modalContent}
      overlayClassName={styles.modalOverlay}
    >
      <h2 className={styles.modalHeader}>{header}</h2>
      <p>{children}</p>
      <div className={styles.modalButtons}>
        <button
          type="button"
          onClick={modalControl.turnOff}
          className={cn(styles.modalButton, styles.modalSecondary)}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => {
            modalControl.turnOff();
            onConfirm();
          }}
          className={cn(styles.modalButton, className)}
          data-testid={testId}
        >
          {buttonText}
        </button>
      </div>
    </Modal>
  );
}

export function StreamControls({
  stream,
  className,
  openerClassName,
  dropdownClassName,
  additionalControls,
  openerText,
  needToUseBlur,
}: {
  stream: RoketoStream;
  className?: string;
  openerClassName?: string;
  dropdownClassName?: string;
  additionalControls?: ReactNode;
  openerText?: ReactNode;
  needToUseBlur?: boolean;
}) {
  const pauseModalControl = useBool(false);
  const stopModalControl = useBool(false);
  const loading = useStore($loading);
  const [menuOpened, setMenuOpened] = useState(false);
  const {isOutgoing, isIncoming, isExternal} = useStoreMap({
    store: $accountId,
    keys: [stream],
    fn(accountId) {
      const outgoing = accountId === stream.owner_id;
      const incoming = accountId === stream.receiver_id;
      const external = !outgoing && !incoming;
      return {isOutgoing: outgoing, isIncoming: incoming, isExternal: external};
    },
  });

  const showStatusOnly = isDead(stream) || isExternal;
  const isStartedAndLocked = wasStartedAndLocked(stream);

  const onClickPause = () => {
    setMenuOpened(false);
    if (isIncoming) {
      pauseModalControl.turnOn();
    } else {
      pauseStream(stream.id);
    }
  };

  const onClickStop = () => {
    setMenuOpened(false);
    stopModalControl.turnOn();
  };

  const opened = menuOpened && !loading;

  useGate(blurGate, {
    modalId: `stream controls ${stream.id}`,
    active: !!needToUseBlur && !showStatusOnly && !isStartedAndLocked && opened,
  });

  const shouldShowStartButton = stream.status !== STREAM_STATUS.Active && isOutgoing;
  const shouldShowPauseButton = stream.status === STREAM_STATUS.Active && !isWithCliff(stream);

  const statusClassName = {
    [styles.active]: isActiveStream(stream),
    [styles.pause]: isPausedStream(stream),
    [styles.stop]: isDead(stream),
  };

  if (showStatusOnly) {
    return <StreamStatus className={className} status={stream.status} />;
  }

  if (isStartedAndLocked) {
    return (
      <div className={cn(styles.relative, className)}>
        <button
          type="button"
          className={cn(styles.dropdownOpener, openerClassName, styles.notAllowed)}
        >
          <StreamStatus status={stream.status} />
        </button>
      </div>
    );
  }

  return (
    <div className={cn(styles.relative, className)}>
      <ConfirmModal
        modalControl={pauseModalControl}
        onConfirm={() => pauseStream(stream.id)}
        header="Are you sure?"
        buttonText="Pause"
        className={styles.modalWarning}
        modalName={`pause stream ${stream.id}`}
      >
        As a stream receiver, you will not be able to resume stream. Only stream owners can resume
        streams.
      </ConfirmModal>
      <ConfirmModal
        modalControl={stopModalControl}
        onConfirm={() => stopStream(stream.id)}
        header="Stop stream"
        buttonText="Stop"
        className={styles.modalDanger}
        testId={testIds.streamModalStopButton}
        modalName={`stop stream ${stream.id}`}
      >
        This action will completely shut down the stream. After that, it can't be turned on.
      </ConfirmModal>
      <DropdownOpener
        opened={opened}
        onChange={setMenuOpened}
        className={cn(styles.dropdownOpener, openerClassName, statusClassName)}
        testId={testIds.streamControlsDropdown}
      >
        {loading
          ? 'Loading...'
          : openerText || <StreamStatus status={stream.status} className={styles.statusPadded} />}
      </DropdownOpener>
      <AdaptiveModal
        compact={needToUseBlur}
        isOpen={opened}
        onClose={() => setMenuOpened(false)}
        modalClassName={styles.modalContent}
        dropdownClassName={cn(styles.controlsMenu, dropdownClassName)}
      >
        {additionalControls && (
          <DropdownMenuItem className={styles.additionalControl}>
            {additionalControls}
          </DropdownMenuItem>
        )}
        {shouldShowStartButton && (
          <DropdownMenuItem>
            <button
              type="button"
              onClick={() => startStream(stream.id)}
              className={cn(styles.controlButton, styles.start)}
              data-testid={testIds.streamStartButton}
            >
              <StartIcon />
              <span>Start</span>{' '}
            </button>
          </DropdownMenuItem>
        )}

        {shouldShowPauseButton && (
          <DropdownMenuItem>
            <button
              type="button"
              onClick={onClickPause}
              className={cn(styles.controlButton, styles.pause)}
              data-testid={testIds.streamPauseButton}
            >
              <PauseIcon />
              <span>Pause</span>
            </button>
          </DropdownMenuItem>
        )}

        {(shouldShowStartButton || shouldShowPauseButton) && <DropdownMenuDivider />}
        <DropdownMenuItem>
          <button
            type="button"
            onClick={onClickStop}
            className={cn(styles.controlButton, styles.stop)}
            data-testid={testIds.streamStopButton}
          >
            <StopIcon />
            <span>Stop</span>
          </button>
        </DropdownMenuItem>
      </AdaptiveModal>
    </div>
  );
}
