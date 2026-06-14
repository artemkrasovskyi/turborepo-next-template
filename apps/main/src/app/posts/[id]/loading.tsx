import { SkeletonCard, SkeletonLine } from '@/features/ui/components/skeleton';

const REPLY_KEYS = ['reply-1', 'reply-2'];

export default function Loading() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-4 px-6 py-12 md:max-w-3xl">
      <SkeletonCard />
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <SkeletonLine className="h-20 w-full" />
        <div className="mt-3 flex justify-end">
          <SkeletonLine className="h-9 w-20" />
        </div>
      </div>
      {REPLY_KEYS.map((key) => (
        <SkeletonCard key={key} />
      ))}
    </main>
  );
}
