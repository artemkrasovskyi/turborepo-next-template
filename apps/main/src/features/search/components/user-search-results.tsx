'use client';

import { FC, useState, useTransition } from 'react';
import type { FollowListPage } from '@repo/types/features/follow';
import { FollowUserCard } from '@/features/follow/components/follow-user-card';
import { loadMoreUserSearchAction } from '../actions';

type UserSearchResultsProps = {
  query: string;
  initialPage: FollowListPage;
  viewerId: string | null;
};

export const UserSearchResults: FC<UserSearchResultsProps> = ({ query, initialPage, viewerId }) => {
  const [items, setItems] = useState(initialPage.items);
  const [nextCursor, setNextCursor] = useState(initialPage.nextCursor);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleLoadMore = () => {
    if (!nextCursor) return;
    setError(null);
    startTransition(async () => {
      try {
        const page = await loadMoreUserSearchAction(query, nextCursor, viewerId ?? undefined);
        setItems((prev) => [...prev, ...page.items]);
        setNextCursor(page.nextCursor);
      } catch {
        setError('Failed to load more. Please try again.');
      }
    });
  };

  if (items.length === 0) {
    return (
      <p className="text-sm text-[var(--color-text-muted)]">
        No users found for &ldquo;{query}&rdquo;.
      </p>
    );
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
            className="focus-ring rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-semibold text-[var(--color-text)] hover:bg-[var(--color-surface-elevated)] disabled:opacity-50"
          >
            {isPending ? 'Loading…' : 'Load more'}
          </button>
          {error ? (
            <p className="text-sm text-[var(--color-danger)]" role="status">
              {error}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
