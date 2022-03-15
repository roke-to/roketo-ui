import { isDead, isFundable } from 'shared/api/roketo/helpers';
import type { RoketoStream } from 'shared/api/roketo/interfaces/entities';
import type { TokenFormatter } from 'shared/helpers/formatting';

export function streamViewData(stream: RoketoStream, tokenFormatter: ReturnType<typeof TokenFormatter>) {
  const tf = tokenFormatter;

  // public link
  const link = `${window.location.origin}/#/streams/${stream.id}`;

  // time left calculations
  const secondsLeft = tf.ticksToMs(
    Math.round(
      (Number(stream.balance) - Number(stream.available_to_withdraw)) / Number(stream.tokens_per_tick),
    ),
  );

  const dateEnd = new Date(new Date().getTime() + secondsLeft);
  const timestampEnd = dateEnd.getTime();

  // progress bar calculations
  const full = Number(stream.balance) + Number(stream.tokens_total_withdrawn);
  const withdrawn = Number(stream.tokens_total_withdrawn);
  const streamed = Number(stream.tokens_total_withdrawn)
    + Number(stream.available_to_withdraw);
  const available = Number(stream.available_to_withdraw);

  const left = full - streamed;
  const progresses = [withdrawn / full, streamed / full];

  const percentages = {
    left: (full - streamed) / full,
    streamed: streamed / full,
    withdrawn: withdrawn / full,
    available: available / full,
  };

  return {
    dateEnd,
    progresses,
    tf,
    isDead: isDead(stream),
    isFundable: isFundable(stream),
    percentages,
    link,
    timestampEnd,
    secondsLeft,
    progress: {
      full,
      withdrawn,
      streamed,
      left,
      available,
    },
  };
}