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
      className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
    >
      <textarea
        id="direct-message-body"
        aria-label="Message"
        value={body}
        onChange={(event) => setBody(event.target.value)}
        maxLength={MAX_DIRECT_MESSAGE_LENGTH}
        rows={3}
        placeholder="Write a message"
        className="focus-ring w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400"
      />
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-xs text-slate-500">
          {body.length}/{MAX_DIRECT_MESSAGE_LENGTH}
        </p>
        <button
          type="submit"
          disabled={isPending}
          className="focus-ring rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50"
        >
          {isPending ? 'Sending...' : 'Send'}
        </button>
      </div>
      {error ? (
        <p className="mt-2 text-sm text-red-600" role="status">
          {error}
        </p>
      ) : null}
    </form>
  );
}
