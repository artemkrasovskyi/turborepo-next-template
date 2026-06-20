'use client';

import type React from 'react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { MAX_DIRECT_MESSAGE_LENGTH } from '@repo/types/features/direct-messages';
import { sendDirectMessageAction } from '../actions';

type DirectMessageComposerProps = {
  conversationId: string;
};

export function DirectMessageComposer({ conversationId }: DirectMessageComposerProps) {
  const router = useRouter();
  const [body, setBody] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await sendDirectMessageAction(conversationId, body);

      if (result.error) {
        setError(result.error);
        return;
      }

      setBody('');
      router.refresh();
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm"
    >
      <textarea
        id="direct-message-body"
        aria-label="Message"
        value={body}
        onChange={(event) => setBody(event.target.value)}
        maxLength={MAX_DIRECT_MESSAGE_LENGTH}
        rows={3}
        placeholder="Write a message"
        className="focus-ring w-full resize-none rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]"
      />
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-xs text-[var(--color-text-muted)]">
          {body.length}/{MAX_DIRECT_MESSAGE_LENGTH}
        </p>
        <button
          type="submit"
          disabled={isPending}
          className="focus-ring rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-[var(--color-accent-foreground)] hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
        >
          {isPending ? 'Sending...' : 'Send'}
        </button>
      </div>
      {error ? (
        <p className="mt-2 text-sm text-[var(--color-danger)]" role="status">
          {error}
        </p>
      ) : null}
    </form>
  );
}
