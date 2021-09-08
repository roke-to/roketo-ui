import React, {useMemo, useState} from 'react';
import {useNear} from '../features/near-connect/useNear';
import {StreamCard} from '../features/stream-view';
import {StreamFilters} from '../features/filtering/streams';
import {Button} from '../components/kit';
import {routes} from '../lib/routing';
import {useStreamControl} from '../features/stream-control/useStreamControl';
import {useAccount, useStreams} from '../features/xyiming-resources';

const __INPUTS = [];
const __OUTPUTS = [];

export function MyStreamsPage() {
  const near = useNear();
  const [token, setToken] = useState('NEAR');
  const [filteredItems, setFiltered] = useState([]);
  const streamControl = useStreamControl();
  const accountSWR = useAccount({near});
  const streamsSWR = useStreams({near, accountSWR});

  const isIncomingStream = (stream) => {
    if (stream.owner_id === near.near.accountId) {
      return false;
    }
    return true;
  };

  async function updateAllAndWithdraw() {
    await streamControl.updateAllAndWithdraw();
    accountSWR.mutate();
  }

  const streams = streamsSWR.data;

  const inputs = streams ? streams.inputs : __INPUTS;
  const outputs = streams ? streams.outputs : __OUTPUTS;
  console.log({inputs, outputs, streams});
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
      <div className="twind-flex twind-mb-12">
        <h1 className="twind-text-3xl ">All Streams</h1>
        <div className="twind-flex-grow"></div>
        <Button
          loading={streamControl.loading}
          loadingText="Updating account..."
          variant="main"
          size="normal"
          onClick={updateAllAndWithdraw}
        >
          Update streams and withdraw
        </Button>
      </div>
      <StreamFilters
        items={allStreams}
        onFilterDone={setFiltered}
        className="twind-mb-10 twind-relative twind-z-10"
      />
      {!streams ? (
        <div>Loading</div>
      ) : allStreams.length === 0 ? (
        <div className="twind-flex twind-flex-col twind-w-80 twind-mx-auto">
          <h3 className="twind-text-3xl twind-text-center twind-my-12 ">
            You dont have any streams yet.
          </h3>
          <Button variant="main" link to={routes.send}>
            Create First Stream
          </Button>
        </div>
      ) : filteredItems.length === 0 ? (
        <h3 className="twind-text-3xl twind-text-center twind-my-12 twind-w-80 twind-mx-auto">
          No streams matching your filters. <br />
          Try selecting different filters!
        </h3>
      ) : (
        filteredItems.map((stream) => (
          <StreamCard
            key={stream.stream_id}
            stream={stream}
            className="twind-mb-4"
            direction={isIncomingStream(stream) ? 'in' : 'out'}
          />
        ))
      )}
    </div>
  );
}
