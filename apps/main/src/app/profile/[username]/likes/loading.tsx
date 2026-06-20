import { SkeletonCard, SkeletonCircle, SkeletonLine } from '@/features/ui/components/skeleton';

const POST_KEYS = ['post-1', 'post-2', 'post-3'];

export default function Loading() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-6 py-12 md:max-w-3xl">
      <header className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <SkeletonCircle className="h-16 w-16" />
          <div className="flex flex-1 flex-col gap-2">
            <SkeletonLine className="h-5 w-40" />
            <SkeletonLine className="h-4 w-28" />
          </div>
        </div>
        <SkeletonLine className="mt-4 h-4 w-full" />
        <SkeletonLine className="mt-3 h-4 w-32" />
        <div className="mt-3 flex gap-4">
          <SkeletonLine className="h-4 w-20" />
          <SkeletonLine className="h-4 w-20" />
        </div>
      </header>
      <div className="flex flex-col gap-4">
        {POST_KEYS.map((key) => (
          <SkeletonCard key={key} />
        ))}
      </div>
    </main>
  );
}
