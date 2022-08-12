import {calculateEndTimestamp, getStreamProgress} from '@roketo/sdk';
import BigNumber from 'bignumber.js';
import classNames from 'classnames';
import {format} from 'date-fns';
import {useStore} from 'effector-react';
import React, {useState} from 'react';
import Modal from 'react-modal';

import {RoketoStream} from '~/shared/api/roketo/interfaces/entities';
import {toYocto} from '~/shared/api/token-formatter';
import {Balance, useBalanceForToken} from '~/shared/components/Balance';
import {testIds} from '~/shared/constants';
import {useBool} from '~/shared/hooks/useBool';
import {useToken} from '~/shared/hooks/useToken';

import {Button, ButtonType} from '@ui/components/Button';
import {Input} from '@ui/components/Input';

import {addFundsFx} from './model';
import styles from './styles.module.scss';

export function AddFunds({stream, className}: {stream: RoketoStream; className?: string}) {
  const addFundsModal = useBool(false);

  const streamEndTimestamp = calculateEndTimestamp(stream);
  const left = +getStreamProgress({stream, asPercentage: true}).left;

  const [deposit, setDeposit] = useState('');
  const currentBalance = useBalanceForToken(stream.token_account_id);
  const hasValidAdditionalFunds = Number(deposit) > 0 && Number(deposit) < Number(currentBalance);

  const isStreamEnded = left === 0;

  const token = useToken(stream.token_account_id);
  const submitting = useStore(addFundsFx.pending);

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
            onSubmit={async (e) => {
              e.preventDefault();
              await addFundsFx({
                streamId: stream.id,
                hasValidAdditionalFunds,
                tokenAccountId: stream.token_account_id,
                deposit,
              });
              addFundsModal.turnOff();
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
                disabled={submitting}
              >
                Cancel
              </button>
              <Button
                type={ButtonType.submit}
                className={styles.modalButton}
                disabled={!hasValidAdditionalFunds || isStreamEnded || submitting}
                testId={testIds.addFundsSubmit}
              >
                {submitting ? 'Adding...' : 'Add funds'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
      <Button onClick={addFundsModal.turnOn} className={className} testId={testIds.addFunds}>
        Add funds
      </Button>
    </>
  );
}
