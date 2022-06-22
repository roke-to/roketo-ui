import BigNumber from 'bignumber.js';
import classNames from 'classnames';
import {format} from 'date-fns';
import React, {useState} from 'react';
import Modal from 'react-modal';

import {streamViewData} from '~/features/roketo-resource';

import {toYocto} from '~/shared/api/ft/token-formatter';
import {RoketoStream} from '~/shared/api/roketo/interfaces/entities';
import {hasPassedCliff, isLocked} from '~/shared/api/roketo/lib';
import {Balance, useBalanceForToken} from '~/shared/components/Balance';
import {useBool} from '~/shared/hooks/useBool';
import {STREAM_DIRECTION, useGetStreamDirection} from '~/shared/hooks/useGetStreamDirection';
import {useToken} from '~/shared/hooks/useToken';

import {Button, ButtonType, DisplayMode} from '@ui/components/Button';
import {Input} from '@ui/components/Input';

import styles from './styles.module.scss';

export function useShouldShowAddFundsButton(stream: RoketoStream) {
  const direction = useGetStreamDirection(stream);
  const isOutgoingStream = direction === STREAM_DIRECTION.OUT;

  return isOutgoingStream && !isLocked(stream);
}

type AddFundsProps = {
  stream: RoketoStream;
  small?: boolean;
};

export function AddFunds({stream, small}: AddFundsProps) {
  const addFundsModal = useBool(false);

  const {
    streamEndTimestamp,
    percentages: {left},
  } = streamViewData(stream);

  const [deposit, setDeposit] = useState('');
  const currentBalance = useBalanceForToken(stream.token_account_id);
  const hasValidAdditionalFunds = Number(deposit) > 0 && Number(deposit) < Number(currentBalance);

  const isStreamEnded = left === 0;

  const shouldShowAddFundsButton = !isStreamEnded && hasPassedCliff(stream);

  const token = useToken(stream.token_account_id);

  let dueDate: string | null = null;
  if (hasValidAdditionalFunds && streamEndTimestamp) {
    const resultTime = new BigNumber(toYocto(token.meta.decimals, deposit))
      .dividedBy(stream.tokens_per_sec)
      .multipliedBy(1000)
      .plus(streamEndTimestamp)
      .toNumber();
    dueDate = format(resultTime, "PP 'at' p");
  }

  return (
    <>
      {addFundsModal.on && (
        <Modal
          isOpen
          onRequestClose={addFundsModal.turnOff}
          className={styles.modalContent}
          overlayClassName={styles.modalOverlay}
        >
          <form
            autoComplete="off"
            onSubmit={(e) => {
              e.preventDefault();

              if (!hasValidAdditionalFunds) {
                return;
              }

              const amount = toYocto(token.meta.decimals, deposit);
              token.api.addFunds(amount, stream.id, window.location.href);
            }}
          >
            <h2 className={styles.modalHeader}>Amount to deposit</h2>
            <div>
              <Balance tokenAccountId={stream.token_account_id} className={styles.label} />
              <Input
                required
                name="deposit"
                placeholder={`0.00 ${token.meta.symbol}`}
                value={deposit ?? ''}
                onChange={(e) => setDeposit(e.target.value)}
              />
              <div
                className={classNames(styles.caption, (dueDate || isStreamEnded) && styles.visible)}
              >
                {isStreamEnded ? (
                  <span className={classNames(styles.label, styles.red)}>
                    Stream has expired, funds can't be added to it anymore.
                  </span>
                ) : (
                  <>
                    <span className={styles.label}>New due date:</span>
                    <span className={classNames(styles.label, styles.bold)}>{dueDate ?? ''}</span>
                  </>
                )}
              </div>
            </div>
            <div className={styles.modalButtons}>
              <button
                type="button"
                onClick={addFundsModal.turnOff}
                className={classNames(styles.modalButton, styles.modalSecondary)}
              >
                Cancel
              </button>
              <Button
                type={ButtonType.submit}
                className={styles.modalButton}
                disabled={!hasValidAdditionalFunds || isStreamEnded}
              >
                Add funds
              </Button>
            </div>
          </form>
        </Modal>
      )}
      {shouldShowAddFundsButton && (
        <Button
          onClick={addFundsModal.turnOn}
          displayMode={small ? DisplayMode.primary : undefined}
        >
          Add funds
        </Button>
      )}
    </>
  );
}
