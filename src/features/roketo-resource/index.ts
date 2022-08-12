import {formatDuration, intervalToDuration} from 'date-fns';

import {shortEnLocale} from '~/shared/lib/date';

export function formatTimeLeft(millisecondsLeft: number) {
  const duration = intervalToDuration({start: 0, end: millisecondsLeft});

  if (duration.days || duration.weeks || duration.months || duration.years) {
    duration.seconds = 0;
  }

  return formatDuration(duration, {locale: shortEnLocale});
}

export function parseComment(description: string): string | null {
  let comment = '';

  try {
    const parsedDescription = JSON.parse(description);
    comment = parsedDescription.comment ?? parsedDescription.c;
  } catch {
    comment = description;
  }

  return comment ?? null;
}

export function parseColor(description: string): string | null {
  let color = 'transparent';

  try {
    const parsedDescription = JSON.parse(description);
    color = parsedDescription.col;
    // eslint-disable-next-line no-empty
  } catch {}

  return color ?? null;
}
