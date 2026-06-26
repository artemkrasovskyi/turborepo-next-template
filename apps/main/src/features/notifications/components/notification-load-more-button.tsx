'use client';

import { FC, useState, useTransition } from 'react';
import type { NotificationItem as NotificationItemData } from '@repo/types/features/notifications';
import { SkeletonNotificationRow } from '@/features/ui/components/skeleton';
import { NotificationItem } from './notification-item';
import { loadMoreNotificationsAction } from '../actions';

type NotificationLoadMoreButtonProps = {
  userId: string;
  initialCursor: string | null;
};

export const NotificationLoadMoreButton: FC<NotificationLoadMoreButtonProps> = ({
  userId,
  initialCursor,
}) => {
  const [items, setItems] = useState<NotificationItemData[]>([]);
  const [cursor, setCursor] = useState(initialCursor);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (cursor === null && items.length === 0) {
    return null;
  }

  const handleLoadMore = () => {
    if (cursor === null) {
      return;
    }

    setError(null);

    startTransition(async () => {
      try {
        const page = await loadMoreNotificationsAction(userId, cursor);
        setItems((current) => [...current, ...page.items]);
        setCursor(page.nextCursor);
      } catch {
        setError('Could not load more notifications. Please try again.');
      }
    });
  }

  return (
    <>
      {items.map((notification) => (
        <NotificationItem key={notification.id} notification={notification} />
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
          <SkeletonNotificationRow />
        </div>
      ) : null}
    </>
  );
}
