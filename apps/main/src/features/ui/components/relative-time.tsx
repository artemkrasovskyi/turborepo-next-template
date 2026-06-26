'use client';

import { FC, useState, useEffect } from 'react';
import { formatRelativeTime } from '@/features/feed/lib/format-relative-time';

type RelativeTimeProps = {
  isoDate: string;
};

export const RelativeTime: FC<RelativeTimeProps> = ({ isoDate }) => {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    setLabel(formatRelativeTime(isoDate));
  }, [isoDate]);

  return <time dateTime={isoDate}>{label ?? isoDate}</time>;
}
