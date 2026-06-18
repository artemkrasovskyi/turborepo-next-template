'use client';

import { useState, useTransition } from 'react';
import type { FollowListPage } from '@repo/types/features/follow';
import { loadMoreFollowersAction } from '../actions';
import { FollowUserCard } from './follow-user-card';

type FollowersListProps = {
  initialPage: FollowListPage;
  userId: string;
  viewerId: string | null;
};

export function FollowersList({ initialPage, userId, viewerId }: FollowersListProps) {
  const [items, setItems] = useState(initialPage.items);
  const [nextCursor, setNextCursor] = useState(initialPage.nextCursor);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleLoadMore() {
    if (!nextCursor) return;
    setError(null);
    startTransition(async () => {
      try {
        const page = await loadMoreFollowersAction(userId, nextCursor, viewerId ?? undefined);
        setItems((prev) => [...prev, ...page.items]);
        setNextCursor(page.nextCursor);
      } catch {
        setError('Failed to load more. Please try again.');
      }
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((user) => (
        <FollowUserCard key={user.id} user={user} viewerId={viewerId} />
      ))}
      {nextCursor ? (
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={isPending}
            className="focus-ring rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
          >
            {isPending ? 'Loading…' : 'Load more'}
          </button>
          {error ? (
            <p className="text-sm text-red-600" role="status">
              {error}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
