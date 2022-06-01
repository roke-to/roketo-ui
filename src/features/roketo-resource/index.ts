import { useEffect, useState } from 'react';
import BigNumber from 'bignumber.js';
import useSWR, { SWRResponse } from 'swr';
import { formatDuration, intervalToDuration } from 'date-fns';

import { getAvailableToWithdraw, isDead, isIdling } from 'shared/api/roketo/helpers';
import { STREAM_STATUS } from 'shared/api/roketo/constants';
import { useRoketoContext } from 'app/roketo-context';
import type { RoketoStream } from 'shared/api/roketo/interfaces/entities';
import { SECONDS_IN_YEAR } from 'shared/constants';
import { shortEnLocale } from 'shared/helpers/date';

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

function calculateEndTimestamp(stream: RoketoStream) {
  /**
   * if stream is not started yet or paused right now
   * then there is no way to calculate stream end time
   * */
  if (isIdling(stream)) return null
  
  const tokensPerMs = new BigNumber(stream.tokens_per_sec).dividedBy(1000)
  const lastActionTime = stream.last_action / 1000_000

  const timeToCompleteEntireStream = new BigNumber(stream.balance).dividedBy(tokensPerMs).toNumber()
  /**
   * if this stream is active but 100% complete then it will be a time in the past
   * as well as in the case of "Finished" stream
   * othewise this stream is still working and this time will be in the future
   */
  return lastActionTime + timeToCompleteEntireStream
}

function calculateCliffPercent(stream: RoketoStream) {
  if (!stream.cliff) {
    return null;
  }

  const endTimestamp = calculateEndTimestamp(stream);

  if (!endTimestamp) {
    return null;
  }

  const cliffDurationMs = (stream.cliff - stream.timestamp_created) / 1000_000;

  const streamDurationMs = endTimestamp - stream.timestamp_created / 1000_000;

  return cliffDurationMs / streamDurationMs * 100;
}

export function streamViewData(stream: RoketoStream, withExtrapolation: boolean = true) {
  const MAX_SEC = SECONDS_IN_YEAR * 1000;

  const availableToWithdraw = withExtrapolation ? getAvailableToWithdraw(stream) : new BigNumber(0);

  const balance = new BigNumber(stream.balance)

  const secondsLeft = BigNumber.minimum(
    MAX_SEC,
    balance
      .minus(availableToWithdraw)
      .dividedBy(stream.tokens_per_sec)
      .toFixed()
  ).toNumber();

  const duration = intervalToDuration({ start: 0, end: secondsLeft * 1000 });

  if (duration.days || duration.weeks || duration.months || duration.years) {
    duration.seconds = 0;
  }

  const timeLeft = formatDuration(duration, { locale: shortEnLocale });

  // progress bar calculations
  const full = balance.plus(stream.tokens_total_withdrawn);
  const withdrawn = new BigNumber(stream.tokens_total_withdrawn);
  const streamed = withdrawn.plus(availableToWithdraw);

  const left = full.minus(streamed);
  const progresses = [
    withdrawn.dividedBy(full).toNumber(),
    streamed.dividedBy(full).toNumber()
  ];

  const percentages = {
    left: full.minus(streamed).multipliedBy(100).dividedBy(full).toNumber(),
    streamed: streamed.multipliedBy(100).dividedBy(full).toNumber(),
    withdrawn: withdrawn.multipliedBy(100).dividedBy(full).toNumber(),
    available: availableToWithdraw.multipliedBy(100).dividedBy(full).toNumber(),
    cliff: calculateCliffPercent(stream),
  };
  
  return {
    secondsLeft,
    progresses,
    isDead: isDead(stream),
    percentages,
    timeLeft,
    streamEndTimestamp: calculateEndTimestamp(stream),
    cliffEndTimestamp: stream.cliff ? stream.cliff / 1000_000 : null,
    progress: {
      full: full.toFixed(),
      withdrawn: withdrawn.toFixed(),
      streamed: streamed.toFixed(),
      left: left.toFixed(),
      available: availableToWithdraw.toFixed(),
    },
  };
}
