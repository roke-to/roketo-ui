import { useEffect, useState } from 'react';
import BigNumber from 'bignumber.js';
import useSWR, { SWRResponse } from 'swr';
import { formatDuration, intervalToDuration } from 'date-fns';

import { getAvailableToWithdraw, isDead } from 'shared/api/roketo/helpers';
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

function calculateEndInfo(stream: RoketoStream, balance: BigNumber) {
  const tokensPerMs = new BigNumber(stream.tokens_per_sec).dividedBy(1000)
  const lastActionTime = stream.last_action / 1000000
  const timeActive = Date.now() - lastActionTime
  const tokensSpentSinceLastActivation = tokensPerMs.multipliedBy(timeActive)
  /** this stream is complete (spent 100% its tokens) but still has status "Active" */
  if (balance.isLessThan(tokensSpentSinceLastActivation)) {
    /** this token was never paused and was started immediately */
    if (stream.timestamp_created === stream.last_action) {
      const timeToCompleteEntireStream = balance.dividedBy(tokensPerMs).toNumber()
      const endTime = lastActionTime + timeToCompleteEntireStream
      return {
        hasEndTime: true,
        endTime,
      }
    }
  } else {
    /** balance changes when stream status changes, for active stream actual balance is smaller */
    const balanceLeft = balance.minus(tokensSpentSinceLastActivation)
    const timeLeftInMs = balanceLeft.dividedBy(tokensPerMs).toNumber()
    return {
      hasEndTime: true,
      endTime: Date.now() + timeLeftInMs
    }
  }
  /**
   * if stream is not started yet, paused right now or was paused in the past and already complete
   * then there is no way to calculate stream end time based only on start time and spending speed
   * */
  return {
    hasEndTime: false,
    endTime: 0,
  }
}

export function streamViewData(stream: RoketoStream, withExtrapolation: boolean = true) {
  const MAX_SEC = SECONDS_IN_YEAR * 1000;

  const availableToWithdraw = withExtrapolation ? getAvailableToWithdraw(stream) : new BigNumber(0);

  const secondsLeft = BigNumber.minimum(
    MAX_SEC,
    new BigNumber(stream.balance)
      .minus(availableToWithdraw)
      .dividedBy(stream.tokens_per_sec)
      .toFixed()
  ).toNumber();

  const duration = intervalToDuration({ start: 0, end: secondsLeft * 1000 });

  if (duration.days || duration.weeks || duration.months || duration.years) {
    duration.seconds = 0;
  }

  const timeLeft = formatDuration(duration, { locale: shortEnLocale });

  const balance = new BigNumber(stream.balance)
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
    left: full.minus(streamed).dividedBy(full).toNumber(),
    streamed: streamed.dividedBy(full).toNumber(),
    withdrawn: withdrawn.dividedBy(full).toNumber(),
    available: availableToWithdraw.dividedBy(full).toNumber(),
  };

  
  return {
    secondsLeft,
    progresses,
    isDead: isDead(stream),
    percentages,
    timeLeft,
    streamEndInfo: calculateEndInfo(stream, balance),
    progress: {
      full: full.toFixed(),
      withdrawn: withdrawn.toFixed(),
      streamed: streamed.toFixed(),
      left: left.toFixed(),
      available: availableToWithdraw.toFixed(),
    },
  };
}
