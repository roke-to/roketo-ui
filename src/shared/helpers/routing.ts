export const routes = {
  authorize: '/authorize',
  account: '/account',
  streams: '/streams',
  send: '/',
  receive: '/receive',
  stream: '/streams/:id',
};

export function getStreamLink(streamId: string | undefined) {
  return `${window.location.origin}/#/streams/${streamId}`;
}
