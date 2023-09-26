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
  topUp: {
    path: '/top-up',
    title: 'Top Up',
  },
  nftStreams: {
    path: '/nft_streams',
    title: 'Streams to NFT',
  },
  stream: {
    path: '/streams/:id',
    title: 'Stream',
  },
  archivedStreams: {
    path: '/archive',
    title: 'Archive',
  },
};

export function getStreamLink(streamId: string | undefined) {
  return `${window.location.origin}/#/streams/${streamId}`;
}
