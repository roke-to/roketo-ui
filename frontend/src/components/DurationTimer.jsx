import React, {useEffect, useState} from 'react';
import {intervalToDuration, formatDuration, isValid} from 'date-fns';

const formatDistanceLocale = {
  xYears: '{{count}} years',
  xMonths: '{{count}} months',
  xDays: '{{count}}d',
  xSeconds: '{{count}}s',
  xMinutes: '{{count}}m',
  xHours: '{{count}}h',
};

const shortEnLocale = {
  formatDistance: (token, count) => {
    return formatDistanceLocale[token].replace('{{count}}', count);
  },
};

function isValidDate(d) {
  return d instanceof Date && !isNaN(d);
}

export function useDurationTimer({untilTimestamp}) {
  const untilDate = new Date(untilTimestamp);
  const dateValid = isValidDate(untilDate);

  const [expired, setExpired] = useState(
    dateValid ? new Date().getTime() > untilDate.getTime() : true,
  );
  const [duration, setDuration] = useState(
    expired ? null : intervalToDuration({start: new Date(), end: untilDate}),
  );

  useEffect(() => {
    const untilDate = new Date(untilTimestamp);

    if (!isValidDate(untilDate)) return;

    let id = setInterval(() => {
      const isExpired = new Date().getTime() > untilDate.getTime();
      setExpired(isExpired);
      setDuration(null);

      if (isExpired) {
        return;
      }

      const duration = intervalToDuration({start: new Date(), end: untilDate});
      setDuration(duration);
    }, 1000);

    return () => clearInterval(id);
  }, [untilTimestamp, expired]);

  return {
    duration,
    dateValid,
    expired,
  };
}

export function DurationTimer({untilTimestamp, suffix, finishedText}) {
  const {duration, dateValid, expired} = useDurationTimer({
    untilTimestamp,
  });

  if (!dateValid) {
    return <span>Invalid Date</span>;
  }

  if (!duration || expired) {
    return <span>{finishedText}</span>;
  }

  if (duration.days || duration.weeks || duration.months || duration.years) {
    duration.seconds = 0;
  }

  const formatted =
    formatDuration(duration, {
      locale: shortEnLocale,
    }) + (suffix || '');

  return <span>{formatted}</span>;
}
