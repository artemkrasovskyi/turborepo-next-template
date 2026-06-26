'use client';

import { useState, useEffect } from 'react';
import { formatRelativeTime } from '@/features/feed/lib/format-relative-time';

type RelativeTimeProps = {
  isoDate: string;
};

export function RelativeTime({ isoDate }: RelativeTimeProps) {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    setLabel(formatRelativeTime(isoDate));
  }, [isoDate]);

  return <time dateTime={isoDate}>{label ?? isoDate}</time>;
}
