import { FC } from 'react';
import type { ViewerUser } from '@repo/types/features/users';
import { NavLinks } from './nav-links';

type NavBarProps = {
  viewer: ViewerUser | null;
};

export const NavBar: FC<NavBarProps> = ({ viewer }) => {
  if (!viewer) {
    return null;
  }

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-10 border-t border-[var(--color-separator)] bg-[var(--color-surface)]/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md sm:sticky sm:top-0 sm:border-b sm:border-t-0"
    >
      <div className="mx-auto flex max-w-2xl items-center justify-around px-4 py-2 sm:justify-center sm:gap-1 md:max-w-3xl">
        <NavLinks viewer={viewer} />
      </div>
    </nav>
  );
}
