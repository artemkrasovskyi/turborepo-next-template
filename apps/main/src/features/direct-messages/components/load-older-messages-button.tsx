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
        const page = await loadOlderMessagesAction(conversationId, viewerId, cursor!);

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
          className="focus-ring self-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
        >
          {isPending ? 'Loading...' : 'Load older'}
        </button>
      ) : null}
      {error ? (
        <p className="text-center text-sm text-red-600" role="status">
          {error}
        </p>
      ) : null}
      {items.map((message) => (
        <MessageBubble key={message.id} message={message} viewerId={viewerId} />
      ))}
    </>
  );
}
