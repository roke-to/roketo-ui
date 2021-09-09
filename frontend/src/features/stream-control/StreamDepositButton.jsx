import React, {useState} from 'react';
import {Button, Input} from '../../components/kit';
import {useStreamControl} from './useStreamControl';
import {TokenFormatter} from '../../lib/formatting';
import {useBool} from '../../lib/useBool';
import Modal from 'react-modal';
import {Plus, PlusGradient} from '../../components/icons';

function useDepositButton({stream}) {
  const controls = useStreamControl(stream.stream_id);
  const [deposit, setDeposit] = useState('');
  const tf = TokenFormatter(stream.token_name);
  const modalControl = useBool(false);

  const modal = (
    <Modal
      isOpen={modalControl.on}
      onRequestClose={modalControl.turnOff}
      className="ModalContent"
      overlayClassName="ModalOverlay"
    >
      <h2 className="twind-text-2xl twind-mb-6">Amount to deposit</h2>
      <Input className="twind-mb-4">
        <input
          placeholder={`0.00 ${stream.token_name}`}
          className="twind-text-black"
          value={deposit}
          onChange={(e) => setDeposit(e.target.value)}
        />
      </Input>

      <Button
        className="twind-w-full"
        variant="filled"
        type="button"
        onClick={() =>
          controls.deposit({
            token: stream.token_name,
            deposit: tf.toInt(deposit),
          })
        }
      >
        Add funds
      </Button>
    </Modal>
  );

  return {
    modal,
    modalControl,
  };
}
export function StreamDepositButton({stream}) {
  const depositButton = useDepositButton({stream});
  return (
    <>
      <Button
        variant="filled"
        type="button"
        onClick={depositButton.modalControl.turnOn}
      >
        <Plus className="twind-mr-2" />
        Add funds
      </Button>
      {depositButton.modal}
    </>
  );
}

export function StreamDepositButtonOutlined({stream, variant = 'filled'}) {
  const depositButton = useDepositButton({stream});
  return (
    <>
      <Button
        variant={variant}
        color="dark"
        type="button"
        onClick={depositButton.modalControl.turnOn}
      >
        <PlusGradient className="twind-mr-2" />
        Add funds
      </Button>
      {depositButton.modal}
    </>
  );
}
