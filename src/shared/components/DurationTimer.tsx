import React, { useEffect, useState } from 'react';
import { intervalToDuration, formatDuration } from 'date-fns';
import { shortEnLocale, isValidDate } from 'shared/helpers/date';

function useDurationTimer(untilTimestamp: number | string) {
  const untilDate = new Date(Number(untilTimestamp));
  const dateValid = isValidDate(untilDate);

  const [expired, setExpired] = useState(
    dateValid ? new Date().getTime() > untilDate.getTime() : true,
  );
  const [duration, setDuration] = useState(
    expired ? null : intervalToDuration({ start: new Date(), end: untilDate }),
  );

  useEffect(() => {
    const untilDateValue = new Date(Number(untilTimestamp));

    if (!isValidDate(untilDateValue)) return undefined;

    const id = setInterval(() => {
      const isExpired = new Date().getTime() > untilDateValue.getTime();
      setExpired(isExpired);
      setDuration(null);

      if (isExpired) {
        return;
      }

      const newDurationValue = intervalToDuration({ start: new Date(), end: untilDateValue });
      setDuration(newDurationValue);
    }, 1000);

    return () => clearInterval(id);
  }, [untilTimestamp, expired]);

  return {
    duration,
    dateValid,
    expired,
  };
}

type DurationTimerProps = {
  untilTimestamp: number | string;
  suffix?: string;
  finishedText?: string;
};

export function DurationTimer({ untilTimestamp, suffix, finishedText }: DurationTimerProps) {
  const { duration, dateValid, expired } = useDurationTimer(untilTimestamp);

  if (!dateValid) {
    return <span>Invalid Date</span>;
  }

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
