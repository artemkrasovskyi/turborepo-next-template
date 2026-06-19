'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { authClient } from '../lib/auth-client';

export function SignUpForm() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const normalizedUsername = username.trim().replace(/^@/, '').toLowerCase();

      const signUpInput = {
        name: displayName.trim(),
        username: normalizedUsername,
        email,
        password,
      } as Parameters<typeof authClient.signUp.email>[0] & { username: string };

      const result = await authClient.signUp.email(signUpInput);

      if (result.error) {
        setError(result.error.message ?? 'Could not create account.');
        return;
      }

      router.push('/');
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label htmlFor="sign-up-display-name" className="flex flex-col gap-1 text-sm font-medium text-slate-700">
        Display name
        <input
          id="sign-up-display-name"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          autoComplete="name"
          required
          className="rounded-lg border border-slate-200 px-3 py-2 text-base text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
        />
      </label>
      <label htmlFor="sign-up-username" className="flex flex-col gap-1 text-sm font-medium text-slate-700">
        Username
        <input
          id="sign-up-username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          autoComplete="username"
          required
          pattern="[A-Za-z0-9_]+"
          className="rounded-lg border border-slate-200 px-3 py-2 text-base text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
        />
      </label>
      <label htmlFor="sign-up-email" className="flex flex-col gap-1 text-sm font-medium text-slate-700">
        Email
        <input
          id="sign-up-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
          className="rounded-lg border border-slate-200 px-3 py-2 text-base text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
        />
      </label>
      <label htmlFor="sign-up-password" className="flex flex-col gap-1 text-sm font-medium text-slate-700">
        Password
        <input
          id="sign-up-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="new-password"
          required
          minLength={8}
          maxLength={128}
          className="rounded-lg border border-slate-200 px-3 py-2 text-base text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
        />
      </label>
      {error ? (
        <p className="text-sm text-red-600" role="status">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={isPending}
        className="focus-ring rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50"
      >
        {isPending ? 'Creating account...' : 'Create account'}
      </button>
      <p className="text-sm text-slate-600">
        Already have an account?{' '}
        <Link href="/sign-in" className="font-semibold text-teal-700 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
