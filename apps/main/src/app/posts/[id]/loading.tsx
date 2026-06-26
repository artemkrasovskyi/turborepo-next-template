import { FC } from 'react';
import { SkeletonCard, SkeletonLine } from '@/features/ui/components/skeleton';

const REPLY_KEYS = ['reply-1', 'reply-2'];

const Loading: FC = () => (
  <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-4 px-6 py-12 md:max-w-3xl">
    <SkeletonCard />
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
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

export default Loading;
