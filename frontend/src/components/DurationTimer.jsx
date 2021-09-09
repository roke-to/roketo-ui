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

export function DurationTimer({untilDate, suffix}) {
  const dateValid = isValidDate(untilDate);

  const [expired, setExpired] = useState(
    dateValid ? new Date().getTime() > untilDate.getTime() : true,
  );
  const [duration, setDuration] = useState(
    expired ? null : intervalToDuration({start: new Date(), end: untilDate}),
  );

  useEffect(() => {
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
  }, [untilDate, expired]);

  if (!dateValid) {
    return <span>Invalid Date</span>;
  }

  const formatted = !duration
    ? ''
    : formatDuration(duration, {
        locale: shortEnLocale,
      }) + (suffix || '');

  return <span>{formatted}</span>;
}
