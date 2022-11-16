import {addDays, addMonths, addWeeks, formatDuration, intervalToDuration} from 'date-fns';

import {ApplicationResponseDto} from '~/shared/api/rb';
import {shortEnLocale} from '~/shared/lib/date';

import type {OrderType} from '@ui/icons/Sort';

export type StatusFilter = 'All' | 'Active' | 'Paused' | 'Stopped' | 'Finished';

export type SubscriptionSort = {
  label: string;
  order: OrderType;
  fn: (a: ApplicationResponseDto, b: ApplicationResponseDto) => number;
};

export type FilterFn = (subscription: ApplicationResponseDto) => boolean;

export function getStatusFilter(status: StatusFilter): FilterFn | null {
  switch (status) {
    case 'Active':
    case 'Paused':
    case 'Stopped':
    case 'Finished':
      return (subscription) => subscription.status === status;
    default:
      return null;
  }
}

export function getTextFilter(text: string): FilterFn | null {
  const trimmedText = text.trim();
  if (trimmedText.length > 0) {
    return ({plan}) =>
      // Change to dao.name
      plan.subscription.dao.id.includes(trimmedText);
  }
  return null;
}

export function calculateTimeLeft(createdAt: string, period: string) {
  const finalDate = calculateFinalDate(createdAt, period);

  if (finalDate) {
    const duration = intervalToDuration({
      start: new Date(),
      end: finalDate,
    });
    const formattedDuration = formatDuration(duration, {locale: shortEnLocale});

    return cutDuration(formattedDuration);
  }
  return null;
}

function cutDuration(duration: string) {
  const durationArray = duration.split(' ');

  if (durationArray.length > 2) {
    return durationArray.splice(0, 2).join(' ');
  }

  return null;
}

export function calculateFinalDate(createdAt: string, period: string) {
  switch (period) {
    case 'Day':
      return addDays(new Date(createdAt), 1);
    case 'Week':
      return addWeeks(new Date(createdAt), 1);
    case 'Month':
      return addMonths(new Date(createdAt), 1);
    default:
      return null;
  }
}
