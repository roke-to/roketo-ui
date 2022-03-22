import React from 'react';
import { intervalToDuration, formatDuration } from 'date-fns';
import { shortEnLocale, isValidDate } from 'shared/helpers/date';

type DurationTimerProps = {
  untilTimestamp: number;
  suffix?: string;
  finishedText?: string;
};

export function DurationTimer({ untilTimestamp, suffix, finishedText }: DurationTimerProps) {
  const untilDate = new Date(untilTimestamp);
  const dateValid = isValidDate(untilDate);

  if (!dateValid) {
    return <span>Invalid Date</span>;
  }

  const expired = dateValid ? Date.now() > untilDate.getTime() : true;
  const duration = expired ? null : intervalToDuration({ start: new Date(), end: untilDate });

  if (!duration || expired) {
    return <span>{finishedText}</span>;
  }

  if (duration.days || duration.weeks || duration.months || duration.years) {
    duration.seconds = 0;
  }

  const formatted = formatDuration(duration, {
    locale: shortEnLocale,
  }) + (suffix || '');

  return <span>{formatted}</span>;
}
