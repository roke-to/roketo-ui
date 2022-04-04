import { addSeconds, millisecondsToSeconds } from 'date-fns';

import { isDead } from 'shared/api/roketo/helpers';
import type { RoketoStream } from 'shared/api/roketo/interfaces/entities';
import { fromNanosecToSec } from 'shared/helpers/date';
import BigNumber from 'bignumber.js';
import { SECONDS_IN_YEAR } from 'shared/constants';

export function streamViewData(stream: RoketoStream) {
  const MAX_SEC = SECONDS_IN_YEAR * 1000;

  // calc current state
  const nowSec = millisecondsToSeconds(Date.now());
  const lastActionSec = fromNanosecToSec(stream.last_action);
  const period = nowSec - lastActionSec;

  const availableToWithdraw = BigNumber.minimum(
    stream.balance, 
    Number(stream.tokens_per_sec) * period
  );

  const secondsLeft = BigNumber.minimum(
    MAX_SEC,
    new BigNumber(stream.balance)
      .minus(availableToWithdraw)
      .dividedBy(stream.tokens_per_sec)
      .toFixed()
  )

  const timestampEnd = addSeconds(new Date(), Number(secondsLeft)).getTime();
  const dateEnd = new Date(timestampEnd);
  
  // progress bar calculations
  const full = new BigNumber(stream.balance).plus(stream.tokens_total_withdrawn);
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
    dateEnd,
    progresses,
    isDead: isDead(stream),
    percentages,
    timestampEnd,
    progress: {
      full: full.toFixed(),
      withdrawn: withdrawn.toFixed(),
      streamed: streamed.toFixed(),
      left: left.toFixed(),
      available: availableToWithdraw.toFixed(),
    },
  };
}
