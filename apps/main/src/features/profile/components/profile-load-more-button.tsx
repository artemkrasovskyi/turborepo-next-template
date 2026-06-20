'use client';

import { useState, useTransition } from 'react';
import type { FeedPost } from '@repo/types/features/feed';
import { FeedItem } from '@/features/feed/components/feed-item';
import { SkeletonCard } from '@/features/ui/components/skeleton';
import { loadMoreProfilePostsAction } from '../actions';

type ProfileLoadMoreButtonProps = {
  userId: string;
  viewerId: string | null;
  initialCursor: string | null;
};

export function ProfileLoadMoreButton({
  userId,
  viewerId,
  initialCursor,
}: ProfileLoadMoreButtonProps) {
  const [items, setItems] = useState<FeedPost[]>([]);
  const [cursor, setCursor] = useState(initialCursor);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (cursor === null && items.length === 0) {
    return null;
  }

  function handleLoadMore() {
    if (cursor === null) {
      return;
    }

    setError(null);

    startTransition(async () => {
      try {
        const page = await loadMoreProfilePostsAction(userId, cursor, viewerId ?? undefined);
        setItems((current) => [...current, ...page.items]);
        setCursor(page.nextCursor);
      } catch {
        setError('Could not load more posts. Please try again.');
      }
    });
  }

  return (
    <>
      {items.map((post) => (
        <FeedItem key={post.id} post={post} viewerId={viewerId} />
      ))}
      {error ? (
        <p className="text-sm text-[var(--color-danger)]" role="status">
          {error}
        </p>
      ) : null}
      {cursor !== null ? (
        <button
          type="button"
          onClick={handleLoadMore}
          disabled={isPending}
          className="focus-ring rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-semibold text-[var(--color-text)] hover:bg-[var(--color-surface-elevated)] disabled:opacity-50"
        >
          {isPending ? 'Loading…' : 'Load more'}
        </button>
      ) : null}
      {isPending ? (
        <div aria-hidden="true">
          <SkeletonCard />
        </div>
      ) : null}
    </>
  );
}
