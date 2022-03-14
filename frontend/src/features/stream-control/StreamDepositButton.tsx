import React, { useState } from 'react';
import Modal from 'react-modal';

import { Button } from 'shared/kit/Button';
import { Input } from 'shared/kit/Input';
import { useBool } from 'shared/hooks/useBool';
import { PlusIcon } from 'shared/icons/Plus';
import { PlusGradientIcon } from 'shared/icons/PlusGradient';
import { useTokenFormatter } from 'shared/hooks/useTokenFormatter';
import { isFundable } from 'shared/api/roketo/helpers';
import type { RoketoStream } from 'shared/api/roketo/interfaces/entities';

import { useStreamControl } from './useStreamControl';

function useDepositButton({ stream }: { stream: RoketoStream }) {
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

type StreamDepositButtonProps = {
  stream: RoketoStream;
  className: string;
};

export function StreamDepositButton({ stream, className }: StreamDepositButtonProps) {
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

type StreamDepositButtonOutlinedProps = {
  stream: RoketoStream;
  variant: string;
};

export function StreamDepositButtonOutlined({ stream, variant = 'filled' }: StreamDepositButtonOutlinedProps) {
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
