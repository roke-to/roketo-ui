export type Route = {
  path: string;
  title: String;
};

export const ROUTES_MAP = {
  root: {
    path: '/',
  },
  authorize: {
    path: '/authorize',
    title: 'Authorize',
  },
  streams: {
    path: '/streams',
    title: 'Streams',
  },
  stream: {
    path: '/streams/:id',
    title: 'Stream',
  },
};

export function getStreamLink(streamId: string | undefined) {
  return `${window.location.origin}/#/streams/${streamId}`;
}
