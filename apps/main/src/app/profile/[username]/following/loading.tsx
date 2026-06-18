import { SkeletonLine, SkeletonNotificationRow } from '@/features/ui/components/skeleton';

const ROW_KEYS = ['a', 'b', 'c', 'd'];

export default function Loading() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-6 py-12 md:max-w-3xl">
      <div className="flex flex-col gap-2">
        <SkeletonLine className="h-4 w-16" />
        <SkeletonLine className="h-8 w-32" />
        <SkeletonLine className="h-4 w-24" />
      </div>
      <div className="flex flex-col gap-3">
        {ROW_KEYS.map((k) => (
          <SkeletonNotificationRow key={k} />
        ))}
      </div>
    </main>
  );
}
