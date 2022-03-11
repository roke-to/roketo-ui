import React, { useState } from 'react';
import Modal from 'react-modal';

import { Button } from 'shared/kit/Button';
import { Input } from 'shared/kit/Input';
import { useBool } from 'shared/hooks/useBool';
import { PlusIcon } from 'shared/icons/Plus';
import { PlusGradientIcon } from 'shared/icons/PlusGradient';
import { useTokenFormatter } from 'shared/hooks/useTokenFormatter';
import { useStreamControl } from './useStreamControl';

import { isFundable } from '../stream-view/lib';

function useDepositButton({ stream }) {
  const controls = useStreamControl(stream.id);
  const [deposit, setDeposit] = useState('');
  const tf = useTokenFormatter(stream.ticker);
  const modalControl = useBool(false);
  const isDisabled = !isFundable(stream);

  const modal = (
    <Modal
      isOpen={modalControl.on}
      onRequestClose={modalControl.turnOff}
      className="ModalContent"
      overlayClassName="ModalOverlay"
    >
      <h2 className="text-2xl mb-6">Amount to deposit</h2>
      <Input className="mb-4">
        <input
          placeholder={`0.00 ${stream.ticker}`}
          className="text-black"
          value={deposit}
          onChange={(e) => setDeposit(e.target.value)}
        />
      </Input>

      <Button
        className="w-full"
        variant="filled"
        type="button"
        onClick={() => controls.deposit({
          token: stream.ticker,
          deposit: tf.toInt(deposit),
        })}
      >
        Add funds
      </Button>
    </Modal>
  );

  return {
    isDisabled,
    modal,
    modalControl,
  };
}

export function StreamDepositButton({ stream, className }) {
  const depositButton = useDepositButton({ stream });

  return (
    <>
      <Button
        variant="filled"
        type="button"
        onClick={depositButton.modalControl.turnOn}
        disabled={depositButton.isDisabled}
        className={className}
      >
        <PlusIcon className="mr-2" />
        Add funds
      </Button>

      {depositButton.modal}
    </>
  );
}

export function StreamDepositButtonOutlined({ stream, variant = 'filled' }) {
  const depositButton = useDepositButton({ stream });

  return (
    <>
      <Button
        disabled={depositButton.isDisabled}
        variant={variant}
        color="dark"
        type="button"
        onClick={depositButton.modalControl.turnOn}
      >
        <PlusGradientIcon className="mr-2" />
        Add funds
      </Button>
      {depositButton.modal}
    </>
  );
}
