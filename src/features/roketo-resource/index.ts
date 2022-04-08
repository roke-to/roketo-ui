import React from 'react';
import { addSeconds } from 'date-fns';
import BigNumber from 'bignumber.js';
import useSWR from 'swr';

import { getAvailableToWithdraw, isDead } from 'shared/api/roketo/helpers';
import { STREAM_STATUS } from 'shared/api/roketo/constants';
import { useRoketoContext } from 'app/roketo-context';
import type { RoketoStream } from 'shared/api/roketo/interfaces/entities';
import { SECONDS_IN_YEAR } from 'shared/constants';

export function useStreams() {
  const { auth, roketo } = useRoketoContext();

  const swr = useSWR(
    ['streams', auth.accountId, roketo.account.last_created_stream],
    async () => {
      const inputs = await roketo.api.getAccountIncomingStreams({ from: 0, limit: 100 });
      const outputs = await roketo.api.getAccountOutgoingtreams({ from: 0, limit: 100 });

      return {
        inputs,
        outputs
      };
    },
  );

  return swr;
}

export function useSingleStream(streamId: string) {
  const { roketo } = useRoketoContext();

  const swr = useSWR<RoketoStream>(
    () => {
      const key = roketo.account
        ? ['stream', streamId, roketo.account.last_created_stream]
        : false;
      return key;
    },
    async () => {
      const stream = await roketo.api.getStream({ streamId });

      return stream;
    },
    {
      errorRetryInterval: 2000,
      errorRetryCount: 3,
    },
  );

  const stream = swr.data;

  const isCompleted = isDead(stream);

  React.useEffect(() => {
    const startPoller = () => setInterval(swr.mutate, 1000);

    if (stream?.status === STREAM_STATUS.Active && !isCompleted) {
      const id = startPoller();
      return () => clearInterval(id);
    }

    return undefined;
  }, [stream?.status, isCompleted, swr]);

  return swr;
}

export function streamViewData(stream: RoketoStream) {
  const MAX_SEC = SECONDS_IN_YEAR * 1000;

  const availableToWithdraw = getAvailableToWithdraw(stream);

  const secondsLeft = BigNumber.minimum(
    MAX_SEC,
    new BigNumber(stream.balance)
      .minus(availableToWithdraw)
      .dividedBy(stream.tokens_per_sec)
      .toFixed()
  )

  const timestampEnd = addSeconds(new Date(), Number(secondsLeft)).getTime();
  const dateEnd = new Date(timestampEnd);
  
  // progress bar calculations
  const full = new BigNumber(stream.balance).plus(stream.tokens_total_withdrawn);
  const withdrawn = new BigNumber(stream.tokens_total_withdrawn);
  const streamed = withdrawn.plus(availableToWithdraw);

  const left = full.minus(streamed);
  const progresses = [
    withdrawn.dividedBy(full).toNumber(),
    streamed.dividedBy(full).toNumber()
  ];

  const percentages = {
    left: full.minus(streamed).dividedBy(full).toNumber(),
    streamed: streamed.dividedBy(full).toNumber(),
    withdrawn: withdrawn.dividedBy(full).toNumber(),
    available: availableToWithdraw.dividedBy(full).toNumber(),
  };

  return {
    dateEnd,
    progresses,
    isDead: isDead(stream),
    percentages,
    timestampEnd,
    progress: {
      full: full.toFixed(),
      withdrawn: withdrawn.toFixed(),
      streamed: streamed.toFixed(),
      left: left.toFixed(),
      available: availableToWithdraw.toFixed(),
    },
  };
}
