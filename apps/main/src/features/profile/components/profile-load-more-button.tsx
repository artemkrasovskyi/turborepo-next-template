'use client';

import { useState, useTransition } from 'react';
import type { FeedPost } from '@repo/types/features/feed';
import { FeedItem } from '@/features/feed/components/feed-item';
import { loadMoreProfilePostsAction } from '../actions';

type ProfileLoadMoreButtonProps = {
  userId: string;
  initialCursor: string | null;
};

export function ProfileLoadMoreButton({ userId, initialCursor }: ProfileLoadMoreButtonProps) {
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
        const page = await loadMoreProfilePostsAction(userId, cursor);
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
        <FeedItem key={post.id} post={post} />
      ))}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {cursor !== null ? (
        <button
          type="button"
          onClick={handleLoadMore}
          disabled={isPending}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
        >
          {isPending ? 'Loading…' : 'Load more'}
        </button>
      ) : null}
    </>
  );
}
