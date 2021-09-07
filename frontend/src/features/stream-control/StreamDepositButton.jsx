import React, {useState} from 'react';
import {Button, Input} from '../../components/kit';
import {useStreamControl} from './useStreamControl';
import {TokenFormatter} from '../../lib/formatting';
import {useBool} from '../../lib/useBool';
import Modal from 'react-modal';
import {Plus} from '../../components/icons';

export function StreamDepositButton({stream}) {
  const controls = useStreamControl(stream.stream_id);
  const [deposit, setDeposit] = useState('');
  const tf = TokenFormatter(stream.token_name);
  const modalControl = useBool(false);

  return (
    <div>
      <Button variant="filled" type="button" onClick={modalControl.turnOn}>
        <Plus className="twind-mr-2" />
        Add funds
      </Button>
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
          onClick={() => controls.deposit({deposit: tf.toInt(deposit)})}
        >
          Add funds
        </Button>
      </Modal>
    </div>
  );
}
