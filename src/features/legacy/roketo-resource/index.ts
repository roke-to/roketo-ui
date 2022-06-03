import React, { useRef } from 'react';
import useSWR, { SWRResponse } from 'swr';
import { differenceInSeconds, formatDuration, intervalToDuration } from 'date-fns';
import BigNumber from 'bignumber.js';

import { useRoketoContext } from '../roketo-context';
import { STREAM_DIRECTION, STREAM_STATUS } from '../api/roketo/constants';
import { LegacyRoketoStream, RoketoAccount } from '../api/roketo/interfaces/entities';
import { TICK_TO_MS, TICK_TO_S } from '../api/roketo/config';
import { isActiveStream, isDead, isIdling } from '../api/roketo/helpers';
import { SECONDS_IN_YEAR } from "~/shared/constants";
import { shortEnLocale } from "~/shared/lib/date";

function identifyStreamsDirection(streams: LegacyRoketoStream[], accountId: string) {
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

function interpolateStream(stream: LegacyRoketoStream, cachedBalance: string, cachedAt: number) {
  if (!isActiveStream(stream)) {
    return stream;
  }

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

export function useLegacyStreams({ account }: { account?: RoketoAccount }) {
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
      ).filter((stream) => !isDead(stream));

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

        const interpolateAll = (stream: LegacyRoketoStream) => interpolateStream(stream, balances.current.values[stream.id], balances.current.cachedAt);

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

export function useLegacySingleStream(streamId: string, account?: RoketoAccount) {
  const { roketo } = useRoketoContext();
  const balance = useRef<Balance>(BALANCE_PLACEHOLDER);
  const interpolationsLeft = useRef(0);

  const swr = useSWR<LegacyRoketoStream>(
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

function calculateEndInfo(stream: LegacyRoketoStream, balance: BigNumber) {
  /**
   * if stream is not started yet or paused right now
   * then there is no way to calculate stream end time
   * */
  if (isIdling(stream)) return null

  const tokensPerMs = new BigNumber(stream.tokens_per_tick).multipliedBy(TICK_TO_MS)
  const lastActionTime = Number(stream.timestamp_created) / 1000000
  // const lastActionTime = stream.last_action / 1000000

  const timeToCompleteEntireStream = balance.dividedBy(tokensPerMs).toNumber()
  /**
   * if this stream is active but 100% complete then it will be a time in the past
   * as well as in the case of "Finished" stream
   * othewise this stream is still working and this time will be in the future
   */
  return lastActionTime + timeToCompleteEntireStream
}

export function streamViewData(stream: LegacyRoketoStream, withExtrapolation: boolean = true) {
  const MAX_SEC = SECONDS_IN_YEAR * 1000;

  const availableToWithdraw = withExtrapolation ? new BigNumber(stream.available_to_withdraw) : new BigNumber(0);

  const secondsLeft = BigNumber.minimum(
    MAX_SEC,
    new BigNumber(stream.balance)
      .minus(availableToWithdraw)
      .dividedBy(stream.tokens_per_tick)
      .dividedBy(TICK_TO_S)
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
