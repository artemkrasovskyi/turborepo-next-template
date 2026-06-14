import { SkeletonCard, SkeletonLine } from '@/features/ui/components/skeleton';

const SKELETON_KEYS = ['skeleton-1', 'skeleton-2', 'skeleton-3'];

export default function Loading() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-6 py-12 md:max-w-3xl">
      <header>
        <SkeletonLine className="h-7 w-24" />
        <SkeletonLine className="mt-2 h-4 w-72" />
      </header>
      <div className="flex flex-col gap-4">
        {SKELETON_KEYS.map((key) => (
          <SkeletonCard key={key} />
        ))}
      </div>
    </main>
  );
}
