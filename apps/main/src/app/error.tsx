'use client';

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-4 px-6 py-12 text-center md:max-w-3xl">
      <h1 className="text-2xl font-semibold text-[var(--color-text)]">Something went wrong</h1>
      <p className="text-sm text-[var(--color-text-muted)]">{error.message}</p>
      <button
        type="button"
        onClick={reset}
        className="focus-ring rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-semibold text-[var(--color-text)] shadow-sm hover:bg-[var(--color-surface-elevated)]"
      >
        Try again
      </button>
    </main>
  );
}
