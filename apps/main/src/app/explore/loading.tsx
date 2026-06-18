import { SkeletonCard, SkeletonLine, SkeletonNotificationRow } from '@/features/ui/components/skeleton';

const USER_KEYS = ['a', 'b', 'c', 'd'];
const POST_KEYS = ['e', 'f', 'g', 'h'];

export default function Loading() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-8 px-6 py-12 md:max-w-3xl">
      <SkeletonLine className="h-8 w-32" />
      <SkeletonLine className="h-10 w-full" />
      <section>
        <SkeletonLine className="mb-4 h-6 w-28" />
        <div className="grid gap-3 sm:grid-cols-2">
          {USER_KEYS.map((k) => (
            <SkeletonNotificationRow key={k} />
          ))}
        </div>
      </section>
      <section>
        <SkeletonLine className="mb-4 h-6 w-40" />
        <div className="flex flex-col gap-4">
          {POST_KEYS.map((k) => (
            <SkeletonCard key={k} />
          ))}
        </div>
      </section>
    </main>
  );
}
