import React, { useState } from 'react';
import useSWR from 'swr';
import { STREAM_DIRECTION, STREAM_STATUS } from '../stream-control/lib';
import { identifyStreamsDirection } from './lib';

async function fetchStream({ streamId }, { roketo }) {
  const stream = await roketo.api.getStream({ streamId });

  return stream;
}

async function fetchStreamHistory({ streamId, from, to }, { roketo }) {
  const streamHistory = await roketo.api.getStreamHistory({
    streamId,
    from,
    to,
  });

  return streamHistory;
}

async function fetchStreams(streams, { auth, roketo }) {
  const fetchedStreams = await Promise.all(
    streams.map((streamId) => roketo.api.getStream({ streamId })),
  );

  const identified = identifyStreamsDirection(
    fetchedStreams,
    auth.accountId,
  );

  return {
    inputs: identified.filter((s) => s.direction === STREAM_DIRECTION.IN),
    outputs: identified.filter((s) => s.direction === STREAM_DIRECTION.OUT),
  };
}

export function useAccount({ auth, roketo }) {
  const swr = useSWR(
    ['account', auth.accountId],
    roketo.api.getCurrentAccount,
    {
      errorRetryInterval: 250,
    },
  );

  return swr;
}

export function useStreams({ auth, roketo, accountSWR }) {
  const account = accountSWR.data;
  const swr = useSWR(
    () => {
      const key = account
        ? ['streams', account.account_id, account.last_action]
        : false;

      return key;
    },
    () => fetchStreams(
      [
        ...account.dynamic_inputs,
        ...account.dynamic_outputs,
        ...account.static_streams,
      ],
      {
        auth,
        roketo
      },
    ),
  );

  return swr;
}

export function useSingleStream({ streamId }, { roketo, accountSWR }) {
  const account = accountSWR.data;
  const swr = useSWR(
    () => {
      const key = account
        ? ['stream', streamId, account.id, account.last_action]
        : false;
      return key;
    },
    async () => {
      const stream = await fetchStream(
        { streamId },
        {
          roketo,
        },
      );

      return stream;
    },
    {
      errorRetryInterval: 2000,
      errorRetryCount: 3,
    },
  );

  const stream = swr.data || {};

  const isCompleted = stream.balance === stream.available_to_withdraw;

  React.useEffect(() => {
    const startPoller = () => setInterval(swr.mutate, 1000);

    if (stream.status === STREAM_STATUS.ACTIVE && !isCompleted) {
      const id = startPoller();
      return () => clearInterval(id);
    }

    return undefined;
  }, [stream.status, isCompleted, swr]);

  return swr;
}

export function useSingleStreamHistory(
  { pageSize = 3 },
  { roketo, accountSWR, streamSWR },
) {
  const PAGE_SIZE = pageSize;
  const account = accountSWR.data;
  const stream = streamSWR.data;
  const streamId = stream ? stream.id : null;
  const [page, setPage] = useState(0);
  const ready = !!stream;

  const maxPage = ready ? Math.ceil(stream.history_len / PAGE_SIZE) - 1 : 0;

  const nextPage = () => {
    setPage(page + 1);
  };
  const prevPage = () => {
    setPage(page - 1);
  };
  const canGoBack = page > 1;

  const swr = useSWR(
    () => {
      const key = stream
        ? ['stream_history', stream.id, account.last_action, page]
        : false;

      return key;
    },
    async () => {
      const streamHistory = await fetchStreamHistory(
        {
          streamId,
          from: page * PAGE_SIZE,
          to: (page + 1) * PAGE_SIZE,
        },
        {
          roketo,
        },
      );
      return streamHistory;
    },
    {
      onError: (error) => {
        console.debug('useSingleStreamHistory error', error);
      },
    },
  );

  // ebanuty hack to prefetch next page
  useSWR(
    () => {
      const key = stream
        ? ['stream_history', stream.id, account.last_action, page + 1]
        : false;

      return key;
    },

    async () => {
      const params = {
        streamId,
        from: (page + 1) * PAGE_SIZE,
        to: (page + 2) * PAGE_SIZE,
      };

      const streamHistory = await fetchStreamHistory(params, {
        roketo,
      });

      return streamHistory;
    },
  );

  return {
    swr, canGoBack, nextPage, prevPage, maxPage, currentPage: page,
  };
}
