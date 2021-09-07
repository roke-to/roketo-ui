import React, {useMemo, useState} from 'react';
import {useNear} from '../features/near-connect/useNear';
import useSWR from 'swr';
import {StreamCard} from '../components/StreamCard';
import {StreamFilters} from '../features/filtering/streams';

const __INPUTS = [];
const __OUTPUTS = [];

export function MyStreamsPage() {
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

  async function fetchStreams({inputs, outputs}) {
    let inputStreams = await Promise.all(
      inputs.map((streamId) => near.contractApi.getStream({streamId})),
    );

    let outputStreams = await Promise.all(
      outputs.map((streamId) => near.contractApi.getStream({streamId})),
    );

    return {
      inputs: inputStreams.map((stream) => ({...stream, direction: 'in'})),
      outputs: outputStreams.map((stream) => ({...stream, direction: 'out'})),
    };
  }

  const {data: streams} = useSWR(
    () => {
      const key = account ? '/streams/' + account.account_id : false;
      return key;
    },
    () => fetchStreams({inputs: account.inputs, outputs: account.outputs}),
  );
  console.log('ACCOUNT', account);

  const inputs = streams ? streams.inputs : __INPUTS;
  const outputs = streams ? streams.outputs : __OUTPUTS;

  const allStreams = useMemo(() => inputs.concat(outputs), [inputs, outputs]);

  async function depositClick(e) {
    e.preventDefault();
    var selectBox = document.getElementById('selectBox');
    if (selectBox.selectedIndex > 0) {
      const stream = outputs[selectBox.selectedIndex - 1];
      if (token === 'NEAR') {
        const deposit =
          String(
            parseInt(
              parseFloat(document.getElementById('depositTokensInput').value) *
                1e9,
            ),
          ) + '000000000000000';
        const res = await near.near.contract.deposit(
          {stream_id: stream.stream_id},
          '200000000000000',
          deposit,
        );
        console.log('deposit NEAR res', res);
      } else {
        const deposit =
          String(
            parseInt(
              parseFloat(document.getElementById('depositTokensInput').value) *
                1e9,
            ),
          ) + '000000000'; // get decimals per each ft contract
        const res = await near.near.ft.ft_transfer_call(
          {
            receiver_id: near.near.near.config.contractName,
            amount: deposit,
            memo: 'xyiming transfer',
            msg: stream.stream_id,
          },
          '200000000000000',
          1,
        );
        console.log('deposit TARAS res', res);
      }
    }
  }

  return (
    <div className="twind-container twind-mx-auto twind-p-12">
      <h1 className="twind-text-3xl twind-mb-12">All Streams</h1>
      <StreamFilters
        items={allStreams}
        onFilterDone={setFiltered}
        className="twind-mb-10"
      />
      {filteredItems.map((stream) => (
        <StreamCard
          stream={stream}
          className="twind-mb-4"
          direction={isIncomingStream(stream) ? 'in' : 'out'}
        />
      ))}
    </div>
  );
}
