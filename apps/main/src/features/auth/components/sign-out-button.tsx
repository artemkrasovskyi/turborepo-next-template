'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { LogOut } from 'lucide-react';
import { authClient } from '../lib/auth-client';

export function SignOutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      await authClient.signOut();
      router.push('/sign-in');
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-label={isPending ? 'Signing out' : 'Sign out'}
      className="focus-ring flex flex-1 flex-col items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] disabled:opacity-50 sm:flex-row sm:gap-2 sm:text-sm"
    >
      <LogOut size={20} aria-hidden="true" />
      <span>{isPending ? 'Signing out' : 'Sign out'}</span>
    </button>
  );
}
