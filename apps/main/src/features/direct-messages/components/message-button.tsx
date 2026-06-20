'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { startConversationAction } from '../actions';

type MessageButtonProps = {
  otherUserId: string;
};

export function MessageButton({ otherUserId }: MessageButtonProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    setError(null);

    startTransition(async () => {
      const result = await startConversationAction(otherUserId);

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
        className="focus-ring rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-semibold text-[var(--color-text)] hover:bg-[var(--color-surface-elevated)] disabled:opacity-50"
      >
        {isPending ? 'Opening...' : 'Message'}
      </button>
      {error ? (
        <p className="mt-2 text-sm text-[var(--color-danger)]" role="status">
          {error}
        </p>
      ) : null}
    </div>
  );
}
