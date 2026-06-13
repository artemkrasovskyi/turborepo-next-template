'use client';

import { useState, useTransition } from 'react';
import { MAX_POST_LENGTH } from '@repo/types/features/posts';
import { createReplyAction } from '../actions';

type ReplyComposerProps = {
  authorId: string;
  parentId: string;
};

export function ReplyComposer({ authorId, parentId }: ReplyComposerProps) {
  const [body, setBody] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const remaining = MAX_POST_LENGTH - body.length;
  const isDisabled = body.trim().length === 0 || remaining < 0 || isPending;

  function handleSubmit() {
    setError(null);

    startTransition(async () => {
      try {
        const result = await createReplyAction(authorId, parentId, body);

        if (result.error) {
          setError(result.error);
          return;
        }

        setBody('');
      } catch {
        setError('Could not post reply. Please try again.');
      }
    });
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder="Post your reply"
        rows={3}
        aria-label="Compose a reply"
        className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-base text-slate-800 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
      />
      <div className="mt-3 flex items-center justify-between">
        <p className={`text-sm ${remaining < 0 ? 'text-red-600' : 'text-slate-500'}`}>
          {remaining} characters left
        </p>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isDisabled}
          className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 disabled:opacity-50"
        >
          {isPending ? 'Replying…' : 'Reply'}
        </button>
      </div>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
