const UNITS: Array<{ unit: Intl.RelativeTimeFormatUnit; ms: number }> = [
  { unit: 'year', ms: 1000 * 60 * 60 * 24 * 365 },
  { unit: 'month', ms: 1000 * 60 * 60 * 24 * 30 },
  { unit: 'week', ms: 1000 * 60 * 60 * 24 * 7 },
  { unit: 'day', ms: 1000 * 60 * 60 * 24 },
  { unit: 'hour', ms: 1000 * 60 * 60 },
  { unit: 'minute', ms: 1000 * 60 },
];

const relativeTimeFormatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

export function formatRelativeTime(isoDate: string): string {
  const diffMs = new Date(isoDate).getTime() - Date.now();
  const absMs = Math.abs(diffMs);

  const unitEntry = UNITS.find(({ ms }) => absMs >= ms);

  if (!unitEntry) {
    return relativeTimeFormatter.format(Math.round(diffMs / 1000), 'second');
  }

  return relativeTimeFormatter.format(Math.round(diffMs / unitEntry.ms), unitEntry.unit);
}
