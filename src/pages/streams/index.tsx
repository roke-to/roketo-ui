import React, { useMemo, useState } from 'react';

import { StreamCard } from 'features/stream-view/StreamCard';
import { StreamFilters } from 'features/filtering/StreamFilters';
import { Button } from 'shared/kit/Button';
import { routes } from 'shared/helpers/routing';
import { useStreams } from 'features/roketo-resource';
import { WithdrawAllButton } from 'features/stream-control/WithdrawAllButton';
import { PageError } from 'shared/components/PageError';
import { useRoketoContext } from 'app/roketo-context';
import type { RoketoStream } from 'shared/api/roketo/interfaces/entities';
import { env } from 'shared/config';

export function StreamsPage() {
  const [filteredItems, setFiltered] = useState<RoketoStream[] | undefined>([]);
  const streamsSWR = useStreams();
  const {priceOracle} = useRoketoContext();

  const streams = streamsSWR.data;
  const { error } = streamsSWR;
  const { inputs, outputs } = streams || {};

  const allStreams = useMemo<RoketoStream[] | undefined>(
    () => ((inputs || outputs) && [...(inputs || []), ...(outputs || [])]),
    [inputs, outputs]
  );

  const nearConversionRate = priceOracle.getPriceInUsd(env.WNEAR_ID, 1);

  return (
    <div className="container mx-auto p-12">
      <div className="flex mb-12">
        <h1 className="text-3xl ">All Streams</h1>
        <div className="flex-grow" />
        <WithdrawAllButton>
          Withdraw all
        </WithdrawAllButton>
      </div>

      <div>Current currency conversion rate is:
        <h2>{`1 Near is approximately equals to ${nearConversionRate}$`}</h2>
      </div>
      
      <StreamFilters
        items={allStreams}
        onFilterDone={setFiltered}
        className="mb-10 relative z-10"
      />

      {error &&
        <PageError
          className="max-w-2xl mx-auto py-32"
          message={error.message}
          onRetry={() => {
            streamsSWR.mutate();
          }}
        />
      }
      
      {!streams && !error &&
        <div>Loading</div>
      }

      {streams && allStreams?.length === 0 &&
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
      }
      
      {streams && filteredItems?.length === 0 && allStreams?.length !== 0 &&
        <h3 className="text-3xl text-center my-12 w-80 mx-auto">
          No streams matching your filters.
          {' '}
          <br />
          Try selecting different filters!
        </h3>
      }

      {filteredItems?.length !== 0 &&
        filteredItems?.map((stream: any) => (
          <StreamCard
            key={stream.id}
            stream={stream}
            className="mb-4"
          />
        ))
      }
    </div>
  );
}
