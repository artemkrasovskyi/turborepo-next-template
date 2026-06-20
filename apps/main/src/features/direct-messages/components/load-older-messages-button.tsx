'use client';

import { useState, useTransition } from 'react';
import type { DirectMessageItem } from '@repo/types/features/direct-messages';
import { loadOlderMessagesAction } from '../actions';
import { MessageBubble } from './message-bubble';

type LoadOlderMessagesButtonProps = {
  conversationId: string;
  viewerId: string;
  initialCursor: string | null;
};

export function LoadOlderMessagesButton({
  conversationId,
  viewerId,
  initialCursor,
}: LoadOlderMessagesButtonProps) {
  const [items, setItems] = useState<DirectMessageItem[]>([]);
  const [cursor, setCursor] = useState(initialCursor);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (cursor === null && items.length === 0) {
    return null;
  }

  function handleLoadOlder() {
    if (cursor === null) {
      return;
    }

    setError(null);

    startTransition(async () => {
      try {
        const page = await loadOlderMessagesAction(conversationId, cursor!);

        if (!page) {
          setError('Could not load older messages. Please try again.');
          return;
        }

        setItems((current) => [...page.messages, ...current]);
        setCursor(page.nextCursor);
      } catch {
        setError('Could not load older messages. Please try again.');
      }
    });
  }

  return (
    <>
      {cursor !== null ? (
        <button
          type="button"
          onClick={handleLoadOlder}
          disabled={isPending}
          className="focus-ring self-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-semibold text-[var(--color-text)] hover:bg-[var(--color-surface-elevated)] disabled:opacity-50"
        >
          {isPending ? 'Loading...' : 'Load older'}
        </button>
      ) : null}
      {error ? (
        <p className="text-center text-sm text-[var(--color-danger)]" role="status">
          {error}
        </p>
      ) : null}
      {items.map((message) => (
        <MessageBubble key={message.id} message={message} viewerId={viewerId} />
      ))}
    </>
  );
}
