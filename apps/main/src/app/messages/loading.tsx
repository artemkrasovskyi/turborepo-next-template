import { FC } from 'react';
import { SkeletonCard } from '@/features/ui/components/skeleton';

const MessagesLoading: FC = () => (
  <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-6 py-12 md:max-w-3xl">
    <header>
      <div className="h-8 w-32 rounded bg-[var(--color-skeleton)]" />
      <div className="mt-2 h-4 w-64 rounded bg-[var(--color-skeleton)]" />
    </header>
    <SkeletonCard />
    <SkeletonCard />
  </main>
);

export default MessagesLoading;
