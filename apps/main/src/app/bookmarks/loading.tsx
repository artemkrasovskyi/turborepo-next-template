import { SkeletonCard } from '@/features/ui/components/skeleton';

export default function BookmarksLoading() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-6 py-12 md:max-w-3xl">
      <header>
        <div className="h-8 w-36 rounded bg-slate-200" />
        <div className="mt-2 h-4 w-52 rounded bg-slate-200" />
      </header>
      <SkeletonCard />
      <SkeletonCard />
    </main>
  );
}
