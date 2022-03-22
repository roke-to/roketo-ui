import React, { useState } from 'react';
import useSWR, { SWRResponse } from 'swr';

import { useRoketoContext } from 'app/roketo-context';
import { STREAM_DIRECTION, STREAM_STATUS } from 'shared/api/roketo/constants';
import { RoketoStream, RoketoAccount } from 'shared/api/roketo/interfaces/entities';

export function identifyStreamsDirection(streams: RoketoStream[], accountId: string) {
  return streams.map((stream) => ({
    ...stream,
    direction:
        stream.owner_id === accountId
          ? STREAM_DIRECTION.OUT
          : stream.receiver_id === accountId
            ? STREAM_DIRECTION.IN
            : null,
  }));
}

export function useAccount(): SWRResponse<RoketoAccount> {
  const { auth, roketo } = useRoketoContext();

  const swr = useSWR(
    ['account', auth.accountId],
    roketo.api.getCurrentAccount,
    {
      errorRetryInterval: 250,
    },
  );

  return swr;
}

type UseStreamsProps = {
  account?: RoketoAccount;
}

export function useStreams({ account }: UseStreamsProps) {
  const { auth, roketo } = useRoketoContext();

  const swr = useSWR(
    () => {
      const key = account
        ? ['streams', account.account_id, account.last_action]
        : false;

      return key;
    },
    async () => {
      const streams = [
        ...account?.dynamic_inputs || [],
        ...account?.dynamic_outputs || [],
        ...account?.static_streams || [],
      ];

      const fetchedStreams = await Promise.all(
        streams.map((streamId) => roketo.api.getStream({ streamId })),
      );

      const identified = identifyStreamsDirection(
        fetchedStreams,
        auth.accountId,
      );

      return {
        inputs: identified.filter((stream) => stream.direction === STREAM_DIRECTION.IN),
        outputs: identified.filter((stream) => stream.direction === STREAM_DIRECTION.OUT),
      };
    },
  );

  return swr;
}

export function useSingleStream(streamId: string, account?: RoketoAccount) {
  const { roketo } = useRoketoContext();

  const swr = useSWR<RoketoStream>(
    () => {
      const key = account
        ? ['stream', streamId, account.account_id, account.last_action]
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

  const stream = swr.data || {
    balance: null,
    available_to_withdraw: null,
    status: null,
  };

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

type UseSingleStreamHistoryProps = {
  account?: RoketoAccount;
  stream?: RoketoStream;
}

export function useSingleStreamHistory(
  { pageSize = 3 },
  { account, stream }: UseSingleStreamHistoryProps,
) {
  const { roketo } = useRoketoContext();

  const streamId = stream ? stream.id : '';
  const [page, setPage] = useState(0);

  const maxPage = stream ? Math.ceil(stream.history_len / pageSize) - 1 : 0;

  const nextPage = () => {
    setPage(page + 1);
  };
  const prevPage = () => {
    setPage(page - 1);
  };
  const canGoBack = page > 1;

  const streamHistoryFetcher = async (key1: unknown, key2: unknown, key3: unknown, pageToFetch: number) => {
    const streamHistory = await roketo.api.getStreamHistory({
      streamId,
      from: pageToFetch * pageSize,
      to: (pageToFetch + 1) * pageSize,
    });

    return streamHistory;
  };

  const swr = useSWR(
    () => {
      const key = stream
        ? ['stream_history', stream.id, account?.last_action, page]
        : false;

      return key;
    },
    streamHistoryFetcher,
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
        ? ['stream_history', stream.id, account?.last_action, page + 1]
        : false;

      return key;
    },
    streamHistoryFetcher,
  );

  return {
    swr, canGoBack, nextPage, prevPage, maxPage, currentPage: page,
  };
}
