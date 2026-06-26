import { FC } from 'react';
import { SkeletonCard } from '@/features/ui/components/skeleton';

const ConversationLoading: FC = () => (
  <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-6 py-12 md:max-w-3xl">
    <SkeletonCard />
    <div className="flex flex-col gap-3">
      <div className="h-16 w-2/3 rounded-lg bg-[var(--color-skeleton)]" />
      <div className="ml-auto h-16 w-2/3 rounded-lg bg-[var(--color-skeleton)]" />
    </div>
    <SkeletonCard />
  </main>
);

export default ConversationLoading;
