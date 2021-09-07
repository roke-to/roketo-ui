import React, {useMemo, useState} from 'react';
import {useNear} from '../features/near-connect/useNear';
import useSWR from 'swr';
import {AccountColumn} from '../components/AccountColumn';
import {StreamFilters} from '../features/filtering/streams';
import {StreamIn, StreamOut, StreamWithdraw} from '../components/icons';

const __INPUTS = [];
const __OUTPUTS = [];

export function AccountPage() {
  const near = useNear();
  const [token, setToken] = useState('NEAR');
  const [filteredItems, setFiltered] = useState([]);

  const isIncomingStream = (stream) => {
    if (stream.owner_id === near.near.accountId) {
      return false;
    }
    return true;
  };

  const {data: account} = useSWR(
    ['account', near.near.accountId],
    near.contractApi.getCurrentAccount,
    {
      errorRetryInterval: 250,
    },
  );

  const inputs = (account && account.inputs) || __INPUTS;
  inputs.forEach((input) => (input.direction = 'in'));
  const outputs = (account && account.outputs) || __OUTPUTS;
  outputs.forEach((output) => (output.direction = 'out'));

  const allStreams = useMemo(() => inputs.concat(outputs), [inputs, outputs]);

  console.log('ACCOUNT', account);

  return (
    <div className="twind-container twind-p-12">
      <h1 className="twind-text-3xl twind-mb-12">My Account</h1>

      <div className="twind-grid twind-grid-cols-3 twind-gap-4">
        <AccountColumn icon={<StreamIn />} header="Receiving" />
        <AccountColumn icon={<StreamOut />} header="Sending" />
        <AccountColumn icon={<StreamWithdraw />} header="Withdraw" />
      </div>
    </div>
  );
}
