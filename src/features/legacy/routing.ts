export const LEGACY_ROUTES_MAP = {
  legacyStreams: {
    path: '/streams/legacy',
    title: 'Streams (legacy)',
  },
  legacyStream: {
    path: '/streams/legacy/:id',
  },
};

export function getLegacyStreamLink(streamId: string | undefined) {
  return `${window.location.origin}/#/streams/legacy/${streamId}`;
}
