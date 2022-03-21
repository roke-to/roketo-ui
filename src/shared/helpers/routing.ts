export const routes = {
  authorize: '/authorize',
  account: '/account',
  streams: '/streams',
  send: '/',
  receive: '/receive',
  stream: (id: string) => `/streams/${id}`,
  streamPattern: '/streams/:id',
};
