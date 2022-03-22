import React, { useRef, useState } from 'react';
import useSWR, { SWRResponse } from 'swr';
import { differenceInSeconds } from 'date-fns';

import { useRoketoContext } from 'app/roketo-context';
import { STREAM_DIRECTION, STREAM_STATUS } from 'shared/api/roketo/constants';
import { RoketoStream, RoketoAccount } from 'shared/api/roketo/interfaces/entities';
import { TICK_TO_S } from 'shared/api/roketo/config';

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

function interpolateStream(stream: RoketoStream, cachedBalance: string, cachedAt: number) {
  const secondsPassed = differenceInSeconds(Date.now(), cachedAt);

  return {
    ...stream,
    available_to_withdraw: String(Math.min(
      Number(cachedBalance) + Number(stream.tokens_per_tick) * TICK_TO_S * secondsPassed,
      Number(stream.balance)
    )),
  };
}

type Balances = {
  values: {
    [id: string]: string;
  };
  cachedAt: number;
};

const BALANCES_PLACEHOLDER: Balances = {
  values: {},
  cachedAt: 0,
};

const INTERPOLATIONS_BETWEEN_MULTIPLE_FETCHES = 29;

export function useStreams({ account }: { account?: RoketoAccount }) {
  const { auth, roketo } = useRoketoContext();

  const balances = useRef<Balances>(BALANCES_PLACEHOLDER);
  const interpolationsLeft = useRef(0);

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

      balances.current = {
        values: identified.reduce((balancesDraft, stream) => Object.assign(balancesDraft, {
          [stream.id]: stream.available_to_withdraw
        }), {}),
        cachedAt: Date.now()
      };

      interpolationsLeft.current = INTERPOLATIONS_BETWEEN_MULTIPLE_FETCHES;

      return {
        inputs: identified.filter((stream) => stream.direction === STREAM_DIRECTION.IN),
        outputs: identified.filter((stream) => stream.direction === STREAM_DIRECTION.OUT),
      };
    },
  );

  React.useEffect(() => {
    const pollerId = setTimeout(() => {
      if (!swr.data || interpolationsLeft.current <= 0) {
        swr.mutate();
      } else {
        interpolationsLeft.current -= 1;

        const interpolateAll = (stream: RoketoStream) => interpolateStream(stream, balances.current.values[stream.id], balances.current.cachedAt);

        swr.mutate({
          inputs: swr.data.inputs.map(interpolateAll),
          outputs: swr.data.outputs.map(interpolateAll),
        }, { revalidate: false });
      }
    }, 1000);

    return () => clearTimeout(pollerId);
  }, [swr]);

  return swr;
}

type Balance = {
  value: string;
  cachedAt: number;
};

const BALANCE_PLACEHOLDER: Balance = {
  value: '',
  cachedAt: 0,
};

const INTERPOLATIONS_BETWEEN_SINGLE_FETCHES = 9;

export function useSingleStream(streamId: string, account?: RoketoAccount) {
  const { roketo } = useRoketoContext();
  const balance = useRef<Balance>(BALANCE_PLACEHOLDER);
  const interpolationsLeft = useRef(0);

  const swr = useSWR<RoketoStream>(
    () => {
      const key = account
        ? ['stream', streamId, account.account_id, account.last_action]
        : false;
      return key;
    },
    async () => {
      const stream = await roketo.api.getStream({ streamId });

      balance.current = {
        value: stream.available_to_withdraw,
        cachedAt: Date.now(),
      };

      interpolationsLeft.current = INTERPOLATIONS_BETWEEN_SINGLE_FETCHES;

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
    if (stream.status === STREAM_STATUS.ACTIVE && !isCompleted) {
      const pollerId = setTimeout(() => {
        if (!swr.data || interpolationsLeft.current <= 0) {
          swr.mutate();
        } else {
          interpolationsLeft.current -= 1;

          swr.mutate(interpolateStream(swr.data, balance.current.value, balance.current.cachedAt), { revalidate: false });
        }
      }, 1000);

      return () => clearTimeout(pollerId);
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
