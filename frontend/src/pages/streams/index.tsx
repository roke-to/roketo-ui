import React, { useMemo, useState } from 'react';

import { useRoketoContext } from 'app/roketo-context';
import { StreamCard } from 'features/stream-view';
import { StreamFilters } from 'features/filtering/streams';
import { Button } from 'shared/kit/Button';
import { routes } from 'shared/helpers/routing';
import { useAccount, useStreams } from 'features/xyiming-resources';
import { StreamWithdrawButton } from 'features/stream-control/StreamWithdrawButton';
import { PageError } from 'shared/components/PageError';

export function StreamsPage() {
  const { auth, roketo } = useRoketoContext();
  const [filteredItems, setFiltered] = useState([]);
  const accountSWR = useAccount({ auth, roketo });
  const streamsSWR = useStreams({ auth, roketo, accountSWR });

  const isIncomingStream = (stream: any) => {
    if (stream.owner_id === auth.accountId) {
      return false;
    }
    return true;
  };

  const streams = streamsSWR.data;
  const { inputs = [], outputs = [] } = streams || {}

  const allStreams = useMemo(() => {
    const concatted = inputs.concat(outputs);
    return concatted;
  }, [inputs, outputs]);
  const error = accountSWR.error || streamsSWR.error;

  return (
    <div className="container mx-auto p-12">
      <div className="flex mb-12">
        <h1 className="text-3xl ">All Streams</h1>
        <div className="flex-grow" />
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
          {/* @ts-ignore */}
          <Button
            variant="main"
            link
            to={routes.send}
            type="button"
          >
            Create First Stream
          </Button>
        </div>
      ) : filteredItems.length === 0 ? (
        <h3 className="text-3xl text-center my-12 w-80 mx-auto">
          No streams matching your filters.
          {' '}
          <br />
          Try selecting different filters!
        </h3>
      ) : (
        filteredItems.map((stream: any) => (
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
