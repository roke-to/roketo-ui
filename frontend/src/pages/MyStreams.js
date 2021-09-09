import React, {useMemo, useState} from 'react';
import {useNear} from '../features/near-connect/useNear';
import {StreamCard} from '../features/stream-view';
import {StreamFilters} from '../features/filtering/streams';
import {Button} from '../components/kit';
import {routes} from '../lib/routing';
import {useStreamControl} from '../features/stream-control/useStreamControl';
import {useAccount, useStreams} from '../features/xyiming-resources';
import {StreamWithdrawButton} from '../features/stream-control/StreamWithdrawButton';

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
  const allStreams = useMemo(() => inputs.concat(outputs), [inputs, outputs]);

  return (
    <div className="twind-container twind-mx-auto twind-p-12">
      <div className="twind-flex twind-mb-12">
        <h1 className="twind-text-3xl ">All Streams</h1>
        <div className="twind-flex-grow"></div>
        <StreamWithdrawButton variant="main" size="normal">
          Update streams and withdraw
        </StreamWithdrawButton>
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
