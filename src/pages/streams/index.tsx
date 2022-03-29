import React, { useMemo, useState } from 'react';

import { StreamCard } from 'features/stream-view';
import { StreamFilters } from 'features/filtering/streams';
import { Button } from 'shared/kit/Button';
import { routes } from 'shared/helpers/routing';
import { useAccount, useStreams } from 'features/roketo-resource';
import { StreamWithdrawButton } from 'features/stream-control/StreamWithdrawButton';
import { PageError } from 'shared/components/PageError';
import { useRoketoContext } from 'app/roketo-context';
import type { RoketoStream } from 'shared/api/roketo/interfaces/entities';

export function StreamsPage() {
  const [filteredItems, setFiltered] = useState<RoketoStream[] | undefined>(undefined);

  const accountSWR = useAccount();
  const streamsSWR = useStreams({ account: accountSWR.data });
  const {priceOracle} = useRoketoContext();

  const nearConversionRate = priceOracle.getPriceInUsd('wrap.testnet', 1);

  const streams = streamsSWR.data;
  const { inputs, outputs } = streams || {};

  const allStreams = useMemo<RoketoStream[] | undefined>(
    () => ((inputs || outputs) && [...(inputs || []), ...(outputs || [])]),
    [inputs, outputs]
  );

  const areStreamsIniting = !allStreams || !filteredItems;

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

      <div>Current currency conversion rate is:
        <h2>{`1 Near is approximately equals to ${nearConversionRate}$`}</h2>
      </div>

      {error ? (
        <PageError
          className="max-w-2xl mx-auto py-32"
          message={error.message}
          onRetry={() => {
            accountSWR.mutate();
            streamsSWR.mutate();
          }}
        />
      ) : areStreamsIniting ? (
        <div>Loading</div>
      ) : allStreams.length === 0 ? (
        <div className="flex flex-col w-80 mx-auto">
          <h3 className="text-3xl text-center my-12 ">
            You dont have any streams yet.
          </h3>
          <Button
            variant="main"
            link
            to={routes.send}
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
          />
        ))
      )}
    </div>
  );
}
