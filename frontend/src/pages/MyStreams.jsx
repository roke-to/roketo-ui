import React, {useMemo, useState} from 'react';
import {useNear} from '../features/near-connect/useNear';
import {StreamCard} from '../features/stream-view';
import {StreamFilters} from '../features/filtering/streams';
import {Button} from '../components/kit/Button';
import {routes} from '../lib/routing';
import {useAccount, useStreams} from '../features/xyiming-resources';
import {StreamWithdrawButton} from '../features/stream-control/StreamWithdrawButton';
import {PageError} from '../components/PageError';

const __INPUTS = [];
const __OUTPUTS = [];

export function MyStreamsPage() {
  const near = useNear();
  const [filteredItems, setFiltered] = useState([]);
  const accountSWR = useAccount({near});
  const streamsSWR = useStreams({near, accountSWR});

  const isIncomingStream = (stream) => {
    if (stream.owner_id === near.near.accountId) {
      return false;
    }
    return true;
  };

  const streams = streamsSWR.data;
  const inputs = streams ? streams.inputs : __INPUTS;
  const outputs = streams ? streams.outputs : __OUTPUTS;
  const allStreams = useMemo(() => {
    const concatted = inputs.concat(outputs);
    return concatted;
  }, [inputs, outputs]);
  const error = accountSWR.error || streamsSWR.error;

  return (
    <div className="container mx-auto p-12">
      <div className="flex mb-12">
        <h1 className="text-3xl ">All Streams</h1>
        <div className="flex-grow"></div>
        <StreamWithdrawButton variant="main" size="normal">
          Update streams and withdraw
        </StreamWithdrawButton>
      </div>
      <StreamFilters
        items={allStreams}
        onFilterDone={setFiltered}
        className="mb-10 relative z-10"
      />

      {error ? (
        <PageError
          className="max-w-2xl mx-auto py-32"
          message={error.message}
          onRetry={() => {
            accountSWR.mutate();
            streamsSWR.mutate();
          }}
        />
      ) : !streams ? (
        <div>Loading</div>
      ) : allStreams.length === 0 ? (
        <div className="flex flex-col w-80 mx-auto">
          <h3 className="text-3xl text-center my-12 ">
            You dont have any streams yet.
          </h3>
          <Button variant="main" link to={routes.send}>
            Create First Stream
          </Button>
        </div>
      ) : filteredItems.length === 0 ? (
        <h3 className="text-3xl text-center my-12 w-80 mx-auto">
          No streams matching your filters. <br />
          Try selecting different filters!
        </h3>
      ) : (
        filteredItems.map((stream) => (
          <StreamCard
            key={stream.id}
            stream={stream}
            className="mb-4"
            direction={isIncomingStream(stream) ? 'in' : 'out'}
          />
        ))
      )}
    </div>
  );
}
