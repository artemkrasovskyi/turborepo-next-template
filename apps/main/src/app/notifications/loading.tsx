import { SkeletonLine, SkeletonNotificationRow } from '@/features/ui/components/skeleton';

const ROW_KEYS = ['row-1', 'row-2', 'row-3', 'row-4'];

export default function Loading() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-4 px-6 py-12 md:max-w-3xl">
      <header>
        <SkeletonLine className="h-7 w-40" />
      </header>
      {ROW_KEYS.map((key) => (
        <SkeletonNotificationRow key={key} />
      ))}
    </main>
  );
}
