import {TokenFormatter} from '../../lib/formatting';
import {STREAM_STATUS} from '../stream-control/lib';

export function streamViewData(stream) {
  const tf = TokenFormatter(stream.token_name);

  // time left calculations
  const secondsLeft = tf.ticksToMs(
    Math.round(
      (stream.balance - stream.available_to_withdraw) / stream.tokens_per_tick,
    ),
  );

  const dateEnd = new Date(new Date().getTime() + secondsLeft);

  // progress bar calculations
  const full = Number(stream.balance) + Number(stream.tokens_total_withdrawn);
  const withdrawn = Number(stream.tokens_total_withdrawn);
  const streamed =
    Number(stream.tokens_total_withdrawn) +
    Number(stream.available_to_withdraw);
  const available = Number(stream.available_to_withdraw);

  const left = full - streamed;
  const progresses = [withdrawn / full, streamed / full];

  const percentages = {
    left: (full - streamed) / full,
    streamed: streamed / full,
    withdrawn: withdrawn / full,
    available: available / full,
  };

  const isDead =
    stream.status === STREAM_STATUS.FINISHED ||
    stream.status === STREAM_STATUS.INTERRUPTED;

  return {
    dateEnd,
    progresses,
    tf,
    isDead,
    percentages,
    progress: {
      full,
      withdrawn,
      streamed,
      left,
      available,
    },
  };
}
