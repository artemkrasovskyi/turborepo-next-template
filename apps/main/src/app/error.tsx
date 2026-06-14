'use client';

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-4 px-6 py-12 text-center md:max-w-3xl">
      <h1 className="text-2xl font-semibold text-slate-950">Something went wrong</h1>
      <p className="text-sm text-slate-600">{error.message}</p>
      <button
        type="button"
        onClick={reset}
        className="focus-ring rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
      >
        Try again
      </button>
    </main>
  );
}
