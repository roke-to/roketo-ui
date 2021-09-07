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

  const inputs = (account && account.inputs) || __INPUTS;
  inputs.forEach((input) => (input.direction = 'in'));
  const outputs = (account && account.outputs) || __OUTPUTS;
  outputs.forEach((output) => (output.direction = 'out'));

  const allStreams = useMemo(() => inputs.concat(outputs), [inputs, outputs]);

  console.log('ACCOUNT', account);
  function selectClick(e) {
    var selectBox = document.getElementById('selectBox');
    if (selectBox.selectedIndex > 0) {
      setToken(outputs[selectBox.selectedIndex - 1].token_name);
    }
  }
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

  // const outputsTable = outputs.map((output, id) => {
  //   return (
  //     <div
  //       className="card"
  //       style={{width: '90%', margin: '15px', backgroundColor: '#141414'}}
  //       key={id}
  //     >
  //       <div className="card-body">
  //         <div className="d-flex flex-row justify-content-between w-100">
  //           <div className="col-2 m-1">{output.receiver_id}</div>
  //           <small className="col-1 m-1">
  //             <small>
  //               <samp className="text-secondary">
  //                 {output.stream_id.substr(0, 6)}...
  //               </samp>
  //             </small>
  //           </small>
  //           <small className="col-1 m-1">
  //             {output.token_name === 'NEAR'
  //               ? fromNear(output.balance).toFixed(2)
  //               : fromTaras(output.balance).toFixed(2)}
  //           </small>
  //           <small className="col-1 m-1">{output.token_name}</small>
  //           <small className="col-1 m-1">
  //             {output.token_name === 'NEAR'
  //               ? (fromNear(output.tokens_per_tick) * 1e9).toFixed(2)
  //               : (fromTaras(output.tokens_per_tick) * 1e9).toFixed(2)}{' '}
  //             {output.token_name}/s
  //           </small>
  //           <small className="col-1 m-1">
  //             {output.token_name === 'NEAR'
  //               ? fromNear(output.tokens_available).toFixed(2)
  //               : fromTaras(output.tokens_available).toFixed(2)}
  //           </small>
  //           <small className="col-1 m-1">
  //             {output.token_name === 'NEAR'
  //               ? fromNear(output.tokens_transferred).toFixed(2)
  //               : fromTaras(output.tokens_transferred).toFixed(2)}
  //           </small>
  //           <small className="col-1 m-1">{output.status}</small>
  //           <div className="col-2 m-1">
  //             <StreamControls output={output} />
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // });

  return (
    <div className="twind-container twind-p-12">
      <h1 className="twind-text-3xl twind-mb-12">All Streams</h1>
      <StreamFilters items={allStreams} onFilterDone={setFiltered} />
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
