'use client';

import { useState, useTransition } from 'react';
import type { FollowListUser } from '@repo/types/features/follow';
import { FollowUserCard } from '@/features/follow/components/follow-user-card';
import { loadMoreSuggestedUsersAction } from '../actions';

type SuggestedUsersLoadMoreButtonProps = {
  initialCursor: string;
  viewerId: string | null;
};

export function SuggestedUsersLoadMoreButton({
  initialCursor,
  viewerId,
}: SuggestedUsersLoadMoreButtonProps) {
  const [items, setItems] = useState<FollowListUser[]>([]);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
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
        const page = await loadMoreSuggestedUsersAction(cursor!, viewerId ?? undefined);
        setItems((current) => [...current, ...page.items]);
        setCursor(page.nextCursor);
      } catch {
        setError('Could not load more suggestions. Please try again.');
      }
    });
  }

  return (
    <>
      {items.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((user) => (
            <FollowUserCard key={user.id} user={user} viewerId={viewerId} />
          ))}
        </div>
      ) : null}
      {error ? (
        <p className="text-sm text-red-600" role="status">
          {error}
        </p>
      ) : null}
      {cursor !== null ? (
        <button
          type="button"
          onClick={handleLoadMore}
          disabled={isPending}
          className="focus-ring rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
        >
          {isPending ? 'Loading…' : 'Load more'}
        </button>
      ) : null}
    </>
  );
}
