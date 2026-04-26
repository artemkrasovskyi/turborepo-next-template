import { getAppName } from '@repo/shared/features/app-config';

export function DashboardHome() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-6 py-12">
      <section className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
          {getAppName()}
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">Main application</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-700">
          A Next.js app inside a Bun-powered Turborepo workspace with Prisma,
          PostgreSQL, Tailwind, ESLint, Prettier, and Stylelint ready to extend.
        </p>
      </section>
    </main>
  );
}
