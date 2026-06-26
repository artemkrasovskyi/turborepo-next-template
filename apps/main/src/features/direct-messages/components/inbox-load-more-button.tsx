'use client';

import Link from 'next/link';
import { FC, useState, useTransition } from 'react';
import type { InboxConversation } from '@repo/types/features/direct-messages';
import { formatRelativeTime } from '@/features/feed/lib/format-relative-time';
import { SkeletonCard } from '@/features/ui/components/skeleton';
import { loadMoreInboxAction } from '../actions';

type InboxLoadMoreButtonProps = {
  initialCursor: string | null;
};

const getInitials = (displayName: string): string =>
  displayName
    .split(' ')
    .filter((part) => part.length > 0)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

export const InboxLoadMoreButton: FC<InboxLoadMoreButtonProps> = ({ initialCursor }) => {
  const [items, setItems] = useState<InboxConversation[]>([]);
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
        const page = await loadMoreInboxAction(cursor!);
        setItems((current) => [...current, ...page.items]);
        setCursor(page.nextCursor);
      } catch {
        setError('Could not load more conversations. Please try again.');
      }
    });
  }

  return (
    <>
      {items.map((conversation) => (
        <Link
          key={conversation.id}
          href={`/messages/${conversation.id}`}
          className="focus-ring flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm hover:bg-[var(--color-surface-elevated)]"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--color-accent)] text-sm font-semibold text-[var(--color-accent-foreground)]">
            {conversation.otherParticipant.avatarUrl ? (
              <img
                src={conversation.otherParticipant.avatarUrl}
                alt={conversation.otherParticipant.displayName}
                className="h-full w-full object-cover"
              />
            ) : (
              getInitials(conversation.otherParticipant.displayName)
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <p className="truncate font-semibold text-[var(--color-text)]">
                {conversation.otherParticipant.displayName}
              </p>
              <p className="shrink-0 text-xs text-[var(--color-text-muted)]">
                {formatRelativeTime(conversation.lastMessageAt)}
              </p>
            </div>
            <p className="truncate text-sm text-[var(--color-text-muted)]">
              {conversation.lastMessage
                ? conversation.lastMessage.body
                : `@${conversation.otherParticipant.username}`}
            </p>
          </div>
        </Link>
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
          {isPending ? 'Loading...' : 'Load more'}
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
