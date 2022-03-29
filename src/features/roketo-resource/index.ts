import React from 'react';
import useSWR, { SWRResponse } from 'swr';

import { isDead } from 'shared/api/roketo/helpers';
import { STREAM_STATUS } from 'shared/api/roketo/constants';
import { RoketoStream, RoketoAccount } from 'shared/api/roketo/interfaces/entities';
import { Roketo } from 'shared/api/roketo';
import { useRoketoContext } from 'app/roketo-context';

export function useAccount(): SWRResponse<RoketoAccount> {
  const { auth, roketo } = useRoketoContext();

  const swr = useSWR(
    ['account', auth.accountId],
    roketo.api.getAccount.bind(roketo.api),
    {
      errorRetryInterval: 250,
    },
  );

  return swr;
}

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

type UseSingleStreamProps = {
  roketo: Roketo;
  accountSWR: SWRResponse<RoketoAccount>;
}

export function useSingleStream(streamId: string, { roketo, accountSWR }: UseSingleStreamProps) {
  const account = accountSWR.data;
  const swr = useSWR<RoketoStream>(
    () => {
      const key = account
        ? ['stream', streamId, account.last_created_stream]
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
