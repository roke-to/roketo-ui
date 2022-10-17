import {parseComment} from '@roketo/sdk';
import type {RoketoStream} from '@roketo/sdk/dist/types';

import type {OrderType} from '@ui/icons/Sort';

export type DirectionFilter = 'All' | 'Incoming' | 'Outgoing';
export type StatusFilter = 'All' | 'Initialized' | 'Active' | 'Paused';

export type StreamSort = {
  label: string;
  order: OrderType;
  fn: (a: RoketoStream, b: RoketoStream) => number;
};

export type FilterFn = (stream: RoketoStream) => boolean;

export function getDirectionFilter(
  accountId: string | null,
  direction: DirectionFilter,
): FilterFn | null {
  switch (direction) {
    case 'Incoming':
      return (stream) => stream.receiver_id === accountId;
    case 'Outgoing':
      return (stream) => stream.owner_id === accountId;
    default:
      return null;
  }
}

export function getStatusFilter(status: StatusFilter): FilterFn | null {
  switch (status) {
    case 'Initialized':
    case 'Active':
    case 'Paused':
      return (stream) => stream.status === status;
    default:
      return null;
  }
}

export function getTextFilter(accountId: string | null, text: string): FilterFn | null {
  const trimmedText = text.trim();
  if (trimmedText.length > 0) {
    return ({description, owner_id, receiver_id}) => {
      const comment = parseComment(description) ?? '';

      const counterActor = accountId === owner_id ? receiver_id : owner_id;
      return comment.includes(trimmedText) || counterActor.includes(trimmedText);
    };
  }
  return null;
}
