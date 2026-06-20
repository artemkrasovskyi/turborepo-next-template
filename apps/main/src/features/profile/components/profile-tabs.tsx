'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type ProfileTabsProps = {
  username: string;
};

export function ProfileTabs({ username }: ProfileTabsProps) {
  const pathname = usePathname();
  const isLikes = pathname === `/profile/${username}/likes`;

  const tabClass = (active: boolean) =>
    [
      'border-b-2 pb-2 text-sm font-semibold',
      active
        ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
        : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]',
    ].join(' ');

  return (
    <nav
      className="flex gap-6 border-b border-[var(--color-separator)]"
      aria-label="Profile sections"
    >
      <Link
        href={`/profile/${username}`}
        aria-current={!isLikes ? 'page' : undefined}
        className={tabClass(!isLikes)}
      >
        Posts
      </Link>
      <Link
        href={`/profile/${username}/likes`}
        aria-current={isLikes ? 'page' : undefined}
        className={tabClass(isLikes)}
      >
        Likes
      </Link>
    </nav>
  );
}
