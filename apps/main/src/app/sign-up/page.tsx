import { FC } from 'react';
import { SignUpForm } from '@/features/auth/components/sign-up-form';

const SignUpPage: FC = () => (
  <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-6 py-12">
    <header>
      <h1 className="text-2xl font-semibold text-[var(--color-text)]">Create account</h1>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">Choose a handle and start using Flock.</p>
    </header>
    <section className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
      <SignUpForm />
    </section>
  </main>
);

export default SignUpPage;
