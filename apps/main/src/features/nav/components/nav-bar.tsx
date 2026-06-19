import Link from 'next/link';
import type { ViewerUser } from '@repo/types/features/users';

type NavBarProps = {
  viewer: ViewerUser | null;
};

const linkClasses =
  'focus-ring flex flex-1 flex-col items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:text-teal-700 sm:flex-row sm:gap-2 sm:text-sm';

export function NavBar({ viewer }: NavBarProps) {
  if (!viewer) {
    return null;
  }

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-10 border-t border-slate-200 bg-white sm:sticky sm:top-0 sm:border-b sm:border-t-0"
    >
      <div className="mx-auto flex max-w-2xl items-center justify-around px-6 py-2 sm:justify-start sm:gap-2 md:max-w-3xl">
        <Link href="/" className={linkClasses}>
          <span aria-hidden="true">🏠</span>
          <span>Home</span>
        </Link>
        <Link href="/explore" className={linkClasses}>
          <span aria-hidden="true">🔍</span>
          <span>Explore</span>
        </Link>
        <Link href="/notifications" className={linkClasses}>
          <span aria-hidden="true">🔔</span>
          <span>Notifications</span>
        </Link>
        <Link href="/messages" className={linkClasses}>
          <span aria-hidden="true">✉</span>
          <span>Messages</span>
        </Link>
        <Link href="/bookmarks" className={linkClasses}>
          <span aria-hidden="true">★</span>
          <span>Bookmarks</span>
        </Link>
        <Link href={`/profile/${viewer.username}`} className={linkClasses}>
          <span aria-hidden="true">👤</span>
          <span>Profile</span>
        </Link>
      </div>
    </nav>
  );
}
