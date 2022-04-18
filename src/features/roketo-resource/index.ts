import {useEffect, useState} from 'react';
import useSWR, {SWRResponse} from 'swr';

import {STREAM_STATUS} from 'shared/api/roketo/constants';
import {useRoketoContext} from 'app/roketo-context';
import type {RoketoStream} from 'shared/api/roketo/interfaces/entities';

function useExtrapolation({ swr, revalidationPeriod, isEnabled = true }: {
  swr: SWRResponse,
  revalidationPeriod: number,
  isEnabled?: boolean,
}) {
  const [secondsTillRevalidation, setSecondsTillRevalidation] = useState(revalidationPeriod);

  useEffect(() => {
    if (!isEnabled) {
      return;
    }

    const id = setTimeout(() => {
      if (secondsTillRevalidation <= 0) {
        setSecondsTillRevalidation(revalidationPeriod);
        swr.mutate();
      } else {
        setSecondsTillRevalidation((secondsLeft) => secondsLeft - 1);
      }
    }, 1000);
    return () => clearTimeout(id);
  }, [swr, secondsTillRevalidation, revalidationPeriod, isEnabled]);
}

export function useStreams() {
  const { auth, roketo } = useRoketoContext();

  const swr = useSWR(
    ['streams', auth.accountId, roketo.account.last_created_stream],
    async () => {
      const inputs = await roketo.api.getAccountIncomingStreams({ from: 0, limit: 100 });
      const outputs = await roketo.api.getAccountOutgoingStreams({ from: 0, limit: 100 });

      return {
        inputs,
        outputs
      };
    },
  );

  useExtrapolation({ swr, revalidationPeriod: 30 });

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

  useExtrapolation({ swr, revalidationPeriod: 10, isEnabled: swr.data?.status === STREAM_STATUS.Active });

  return swr;
}

