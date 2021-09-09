import useSWR from 'swr';

async function fetchStream({streamId}, {near}) {
  let stream = await near.contractApi.getStream({streamId});

  return stream;
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
