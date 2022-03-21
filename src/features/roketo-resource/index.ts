import React, { useState } from 'react';
import useSWR, { SWRResponse } from 'swr';

import { STREAM_DIRECTION, STREAM_STATUS } from 'shared/api/roketo/constants';
import { RoketoStream, RoketoAccount } from 'shared/api/roketo/interfaces/entities';
import { NearAuth } from 'shared/api/near';
import { Roketo } from 'shared/api/roketo';

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

type UseAccountProps = {
  auth: NearAuth;
  roketo: Roketo;
}

export function useAccount({ auth, roketo }: UseAccountProps): SWRResponse<RoketoAccount> {
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
  auth: NearAuth;
  roketo: Roketo;
  account?: RoketoAccount;
}

export function useStreams({ auth, roketo, account }: UseStreamsProps) {
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

type UseSingleStreamProps = {
  roketo: Roketo;
  account?: RoketoAccount;
}

export function useSingleStream(streamId: string, { roketo, account }: UseSingleStreamProps) {
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
  roketo: Roketo;
  account?: RoketoAccount;
  stream?: RoketoStream;
}

export function useSingleStreamHistory(
  { pageSize = 3 },
  { roketo, account, stream }: UseSingleStreamHistoryProps,
) {
  const PAGE_SIZE = pageSize;
  const streamId = stream ? stream.id : '';
  const [page, setPage] = useState(0);

  const maxPage = stream ? Math.ceil(stream.history_len / PAGE_SIZE) - 1 : 0;

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
        ? ['stream_history', stream.id, account?.last_action, page]
        : false;

      return key;
    },
    async () => {
      const streamHistory = await roketo.api.getStreamHistory({
        streamId,
        from: page * PAGE_SIZE,
        to: (page + 1) * PAGE_SIZE,
      });

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
        ? ['stream_history', stream.id, account?.last_action, page + 1]
        : false;

      return key;
    },

    async () => {
      const streamHistory = await roketo.api.getStreamHistory({
        streamId,
        from: (page + 1) * PAGE_SIZE,
        to: (page + 2) * PAGE_SIZE,
      });

      return streamHistory;
    },
  );

  return {
    swr, canGoBack, nextPage, prevPage, maxPage, currentPage: page,
  };
}
