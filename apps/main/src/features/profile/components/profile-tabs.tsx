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
    active
      ? 'border-b-2 border-teal-600 pb-2 text-sm font-semibold text-teal-600'
      : 'border-b-2 border-transparent pb-2 text-sm font-semibold text-slate-500 hover:text-slate-700';

  return (
    <nav className="flex gap-6 border-b border-slate-200" aria-label="Profile sections">
      <Link href={`/profile/${username}`} className={tabClass(!isLikes)}>
        Posts
      </Link>
      <Link href={`/profile/${username}/likes`} className={tabClass(isLikes)}>
        Likes
      </Link>
    </nav>
  );
}
