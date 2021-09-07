import React, {useState} from 'react';
import {useNear} from '../features/near-connect/useNear';
import useSWR from 'swr';
import {fromNear, fromTaras} from '../components/Helpers';
import {StreamControls} from '../features/stream-control/StreamControls';
import {NEAR, loader, TARAS} from '../components/Helpers';
import {CategoryTabs, Filter, FilterOptionWithCounter} from '../components/kit';
import {StreamCard} from '../components/StreamCard';

const STREAM_STATUS = {
  ARCHIVED: 'ARCHIVED',
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
};
const STREAM_DIRECTION = {
  IN: 'in',
  OUT: 'out',
};
const STREAM_TYPE_FILTER = {
  ALL: 'All',
  INCOMING: 'Incoming',
  OUTGOING: 'Outgoing',
};

const STREAM_STATUS_FILTER = {
  ALL: 'All',
  ACTIVE: 'Active',
  ARCHIVED: 'Archived',
};

function useFilters({items, filters}) {
  console.log('UseFilters', {items, filters});
  return items.filter((item) => filters.every((filter) => filter(item)));
}

function useStreamFilters(streams) {
  const [statusFilterValue, setStatusFilter] = useState(
    STREAM_STATUS_FILTER.ACTIVE,
  );
  const [directionFilterValue, setDirectionFilter] = useState(
    STREAM_TYPE_FILTER.ALL,
  );

  const statusFilters = {
    [STREAM_STATUS_FILTER.ALL]: () => true,
    [STREAM_STATUS_FILTER.ACTIVE]: (stream) =>
      stream.status === STREAM_STATUS.ACTIVE,
    [STREAM_STATUS_FILTER.ARCHIVED]: (stream) =>
      stream.status === STREAM_STATUS.ARCHIVED,
  };

  const directionFilters = {
    [STREAM_TYPE_FILTER.ALL]: () => true,
    [STREAM_TYPE_FILTER.INCOMING]: (stream) =>
      STREAM_DIRECTION.IN === stream.direction,
    [STREAM_TYPE_FILTER.OUTGOING]: (stream) =>
      STREAM_DIRECTION.OUT === stream.direction,
  };

  const filteredItems = useFilters({
    items: streams,
    filters: [
      directionFilters[directionFilterValue],
      statusFilters[statusFilterValue],
    ],
  });

  return {
    directionFilterValue,
    statusFilterValue,
    setDirectionFilter,
    setStatusFilter,
    filteredItems,
  };
}

export function MyStreamsPage() {
  const near = useNear();
  const [token, setToken] = useState('NEAR');

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

  const inputs = (account && account.inputs) || [];
  inputs.forEach((input) => (input.direction = 'in'));
  const outputs = (account && account.outputs) || [];
  outputs.forEach((output) => (output.direction = 'out'));

  const allStreams = inputs.concat(outputs);

  const filter = useStreamFilters(allStreams);
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
      <div className="twind-flex">
        <Filter
          className="twind-mr-5"
          options={Object.values(STREAM_TYPE_FILTER)}
          label="Type:"
          active={filter.directionFilterValue}
          onChange={filter.setDirectionFilter}
          renderOption={(option) => {
            const countMap = {
              [STREAM_TYPE_FILTER.INCOMING]: inputs.length,
              [STREAM_TYPE_FILTER.OUTGOING]: outputs.length,
              [STREAM_TYPE_FILTER.ALL]: inputs.length + outputs.length,
            };

            return (
              <FilterOptionWithCounter
                option={option}
                count={countMap[option]}
              />
            );
          }}
        />
        <Filter
          options={Object.values(STREAM_STATUS_FILTER)}
          label="Status:"
          active={filter.statusFilterValue}
          onChange={filter.setStatusFilter}
          renderOption={(option) => {
            const countMap = {
              [STREAM_STATUS_FILTER.ACTIVE]: allStreams.filter(
                (stream) => stream.status === STREAM_STATUS.ACTIVE,
              ).length,
              [STREAM_STATUS_FILTER.ALL]: allStreams.length,
              [STREAM_STATUS_FILTER.ARCHIVED]: allStreams.filter(
                (stream) => stream.status === STREAM_STATUS.ARCHIVED,
              ).length,
            };

            return (
              <FilterOptionWithCounter
                option={option}
                count={countMap[option]}
              />
            );
          }}
        />
      </div>

      {filter.filteredItems.map((stream) => (
        <StreamCard
          stream={stream}
          className="twind-mb-4"
          direction={isIncomingStream(stream) ? 'in' : 'out'}
        />
      ))}
    </div>
  );
}
