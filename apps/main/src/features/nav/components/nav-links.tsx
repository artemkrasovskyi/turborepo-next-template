'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, Bookmark, Home, LogOut, Mail, Search, User } from 'lucide-react';
import type { ViewerUser } from '@repo/types/features/users';
import { SignOutButton } from '@/features/auth/components/sign-out-button';

type NavLinksProps = {
  viewer: ViewerUser;
};

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  matchExact?: boolean;
};

export function NavLinks({ viewer }: NavLinksProps) {
  const pathname = usePathname();

  const items: NavItem[] = [
    { href: '/', label: 'Home', icon: <Home size={20} aria-hidden="true" />, matchExact: true },
    { href: '/explore', label: 'Explore', icon: <Search size={20} aria-hidden="true" /> },
    { href: '/notifications', label: 'Notifications', icon: <Bell size={20} aria-hidden="true" /> },
    { href: '/messages', label: 'Messages', icon: <Mail size={20} aria-hidden="true" /> },
    { href: '/bookmarks', label: 'Bookmarks', icon: <Bookmark size={20} aria-hidden="true" /> },
    {
      href: `/profile/${viewer.username}`,
      label: 'Profile',
      icon: <User size={20} aria-hidden="true" />,
    },
  ];

  return (
    <>
      {items.map((item) => {
        const isActive = item.matchExact ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? 'page' : undefined}
            className={[
              'focus-ring flex flex-1 flex-col items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium sm:flex-row sm:gap-2 sm:text-sm',
              isActive
                ? 'text-[var(--color-accent)]'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]',
            ].join(' ')}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        );
      })}
      <SignOutButton />
    </>
  );
}

export { LogOut };
