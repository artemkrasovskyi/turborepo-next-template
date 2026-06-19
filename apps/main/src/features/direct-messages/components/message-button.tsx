'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { startConversationAction } from '../actions';

type MessageButtonProps = {
  viewerId: string;
  otherUserId: string;
};

export function MessageButton({ viewerId, otherUserId }: MessageButtonProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    setError(null);

    startTransition(async () => {
      const result = await startConversationAction(viewerId, otherUserId);

      if (result.error) {
        setError(result.error);
        return;
      }

      router.push(`/messages/${result.id}`);
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="focus-ring rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
      >
        {isPending ? 'Opening...' : 'Message'}
      </button>
      {error ? (
        <p className="mt-2 text-sm text-red-600" role="status">
          {error}
        </p>
      ) : null}
    </div>
  );
}
