export type Route = {
  path: string,
  title: String,
}

export const ROUTES_MAP = {
  root: {
    path: '/',
  },
  authorize: {
    path: '/authorize',
    title: 'Authorize',
  },
  account: {
    path: '/account',
    title: 'Account',
  },
  streams: {
    path: '/streams',
    title: 'Streams',
  },
  stream: {
    path: '/streams/:id',
    title: 'Stream'
  },
  profile: {
    path: '/profile',
    title: 'Profile',
  },
  notifications: {
    path: '/notifications',
    title: 'Notifications',
  },
};

export function getStreamLink(streamId: string | undefined) {
  return `${window.location.origin}/#/streams/${streamId}`;
}
