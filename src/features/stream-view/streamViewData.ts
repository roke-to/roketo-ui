import { isDead } from 'shared/api/roketo/helpers';
import type { RoketoStream } from 'shared/api/roketo/interfaces/entities';
import type { TokenFormatter } from 'shared/helpers/formatting';

export function streamViewData(stream: RoketoStream, tokenFormatter: ReturnType<typeof TokenFormatter>) {
  // public link
  const link = `${window.location.origin}/#/streams/${stream.id}`;

  // time left calculations
  const microsecondsLeft = tokenFormatter.ticksToMs(
    Math.round(
      (Number(stream.balance) - Number(stream.available_to_withdraw)) / Number(stream.tokens_per_tick),
    ),
  );

  const dateEnd = new Date(new Date().getTime() + microsecondsLeft);
  const timestampEnd = dateEnd.getTime();

  // progress bar calculations
  const full = Number(stream.balance) + Number(stream.tokens_total_withdrawn);
  const withdrawn = Number(stream.tokens_total_withdrawn);
  const available = Number(stream.available_to_withdraw);
  const streamed = withdrawn + available;

  const left = full - streamed;
  const progresses = [withdrawn / full, streamed / full];

  const percentages = {
    left: left / full,
    streamed: streamed / full,
    withdrawn: withdrawn / full,
    available: available / full,
  };

  return {
    dateEnd,
    progresses,
    isDead: isDead(stream),
    percentages,
    link,
    timestampEnd,
    progress: {
      full,
      withdrawn,
      streamed,
      left,
      available,
    },
  };
}
