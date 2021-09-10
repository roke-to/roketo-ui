import {useState} from 'react';
import useSWR from 'swr';

async function fetchStream({streamId}, {near}) {
  let stream = await near.contractApi.getStream({streamId});

  return stream;
}

async function fetchStreamHistory({streamId, from, to}, {near}) {
  let streamHistory = await near.contractApi.getStreamHistory({
    streamId,
    from,
    to,
  });

  return streamHistory;
}

async function fetchStreams({inputs, outputs}, {near}) {
  let inputStreams = await Promise.all(
    inputs.map((streamId) => near.contractApi.getStream({streamId})),
  );

  let outputStreams = await Promise.all(
    outputs.map((streamId) => near.contractApi.getStream({streamId})),
  );

  return {
    inputs: inputStreams.map((stream) => ({...stream, direction: 'in'})),
    outputs: outputStreams.map((stream) => ({...stream, direction: 'out'})),
  };
}

export function useAccount({near}) {
  const swr = useSWR(
    ['account', near.near.accountId],
    near.contractApi.getCurrentAccount,
    {
      errorRetryInterval: 250,
    },
  );

  return swr;
}

export function useStreams({near, accountSWR}) {
  const account = accountSWR.data;
  const swr = useSWR(
    () => {
      const key = account
        ? ['streams', account.account_id, account.last_action]
        : false;

      return key;
    },
    () =>
      fetchStreams(
        {inputs: account.inputs, outputs: account.outputs},
        {
          near,
        },
      ),
  );

  return swr;
}

export function useSingleStream({streamId}, {near, accountSWR}) {
  const account = accountSWR.data;
  const swr = useSWR(
    () => {
      const key = account
        ? ['stream', streamId, account.id, account.last_action]
        : false;
      return key;
    },
    async () => {
      let stream = await fetchStream(
        {streamId: streamId},
        {
          near,
        },
      );

      return stream;
    },
  );

  return swr;
}

export function useSingleStreamHistory(
  {pageSize = 3},
  {near, accountSWR, streamSWR},
) {
  const PAGE_SIZE = pageSize;
  const account = accountSWR.data;
  const stream = streamSWR.data;
  const streamId = stream ? stream.stream_id : null;
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
        ? ['stream_history', stream.stream_id, account.last_action, page]
        : false;

      return key;
    },
    async () => {
      let streamHistory = await fetchStreamHistory(
        {
          streamId: streamId,
          from: page * PAGE_SIZE,
          to: (page + 1) * PAGE_SIZE,
        },
        {
          near,
        },
      );
      return streamHistory;
    },
    {
      onError: (error, key) => {
        console.log('useSingleStreamHistory error', error);
      },
    },
  );

  // ebanuty hack to prefetch next page
  const swr2 = useSWR(
    () => {
      const key = stream
        ? ['stream_history', stream.stream_id, account.last_action, page + 1]
        : false;

      return key;
    },

    async () => {
      const params = {
        streamId: streamId,
        from: (page + 1) * PAGE_SIZE,
        to: (page + 2) * PAGE_SIZE,
      };

      let streamHistory = await fetchStreamHistory(params, {
        near,
      });

      return streamHistory;
    },
  );

  return {swr, canGoBack, nextPage, prevPage, maxPage, currentPage: page};
}
