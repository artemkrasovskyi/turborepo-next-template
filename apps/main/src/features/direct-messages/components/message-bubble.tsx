import { FC } from 'react';
import type { DirectMessageItem } from '@repo/types/features/direct-messages';
import { RelativeTime } from '@/features/ui/components/relative-time';

type MessageBubbleProps = {
  message: DirectMessageItem;
  viewerId: string;
};

export const MessageBubble: FC<MessageBubbleProps> = ({ message, viewerId }) => {
  const isOwnMessage = message.sender.id === viewerId;

  return (
    <div className={isOwnMessage ? 'flex justify-end' : 'flex justify-start'}>
      <div
        className={
          isOwnMessage
            ? 'max-w-[80%] rounded-xl bg-[var(--color-accent)] px-4 py-3 text-[var(--color-accent-foreground)]'
            : 'max-w-[80%] rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-[var(--color-text)] shadow-sm'
        }
      >
        <p className="whitespace-pre-wrap text-sm leading-6">{message.body}</p>
        <p className={isOwnMessage ? 'mt-1 text-xs text-[var(--color-accent-foreground)]/70' : 'mt-1 text-xs text-[var(--color-text-muted)]'}>
          <RelativeTime isoDate={message.createdAt} />
        </p>
      </div>
    </div>
  );
}
