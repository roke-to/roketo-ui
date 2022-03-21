export const formatDistanceLocale = {
  xYears: '{{count}} years',
  xMonths: '{{count}} months',
  xDays: '{{count}}d',
  xSeconds: '{{count}}s',
  xMinutes: '{{count}}m',
  xHours: '{{count}}h',
} as const;

type TokenType = keyof typeof formatDistanceLocale;

export const shortEnLocale = {
  formatDistance: (token: TokenType, count: string) => formatDistanceLocale[token].replace('{{count}}', count),
};

export function isValidDate(d: Date) {
  return !Number.isNaN(d.getTime());
}
