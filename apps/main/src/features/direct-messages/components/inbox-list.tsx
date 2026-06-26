import Link from 'next/link';
import { createDirectMessagesClient } from '@repo/api-client/features/direct-messages';
import { EmptyState } from '@/features/ui/components/empty-state';
import { RelativeTime } from '@/features/ui/components/relative-time';
import { InboxLoadMoreButton } from './inbox-load-more-button';

const directMessagesClient = createDirectMessagesClient();

type InboxListProps = {
  viewerId: string;
};

const getInitials = (displayName: string): string =>
  displayName
    .split(' ')
    .filter((part) => part.length > 0)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

export const InboxList = async ({ viewerId }: InboxListProps) => {
  const { items, nextCursor } = await directMessagesClient.getInbox({ viewerId });

  if (items.length === 0) {
    return (
      <EmptyState
        heading="No messages yet"
        description="Open a profile and start a conversation."
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
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
                <RelativeTime isoDate={conversation.lastMessageAt} />
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
      <InboxLoadMoreButton initialCursor={nextCursor} />
    </div>
  );
}
