import { SignInForm } from '@/features/auth/components/sign-in-form';

export default function SignInPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-6 py-12">
      <header>
        <h1 className="text-2xl font-semibold text-[var(--color-text)]">Sign in</h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">Use your Flock account to continue.</p>
      </header>
      <section className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
        <SignInForm />
      </section>
    </main>
  );
}
