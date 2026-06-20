'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';
import { authClient } from '../lib/auth-client';

const inputClass =
  'focus-ring rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-base text-[var(--color-text)]';
const labelClass = 'flex flex-col gap-1 text-sm font-medium text-[var(--color-text-muted)]';

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await authClient.signIn.email({
        email,
        password,
      });

      if (result.error) {
        setError(result.error.message ?? 'Could not sign in.');
        return;
      }

      router.push(searchParams.get('callbackUrl') ?? '/');
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label htmlFor="sign-in-email" className={labelClass}>
        Email
        <input
          id="sign-in-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
          className={inputClass}
        />
      </label>
      <label htmlFor="sign-in-password" className={labelClass}>
        Password
        <input
          id="sign-in-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
          minLength={8}
          className={inputClass}
        />
      </label>
      {error ? (
        <p className="text-sm text-[var(--color-danger)]" role="status">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={isPending}
        className="focus-ring rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-[var(--color-accent-foreground)] hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
      >
        {isPending ? 'Signing in…' : 'Sign in'}
      </button>
      <p className="text-sm text-[var(--color-text-muted)]">
        Need an account?{' '}
        <Link href="/sign-up" className="focus-ring rounded font-semibold text-[var(--color-accent)] hover:underline">
          Sign up
        </Link>
      </p>
    </form>
  );
}
