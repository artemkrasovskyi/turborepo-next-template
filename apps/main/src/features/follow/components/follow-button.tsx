'use client';

import { useState, useTransition } from 'react';
import { toggleFollowAction } from '../actions';

type FollowButtonProps = {
  viewerId: string;
  targetUserId: string;
  initialIsFollowing: boolean;
};

export function FollowButton({ viewerId, targetUserId, initialIsFollowing }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (viewerId === targetUserId) {
    return null;
  }

  function handleClick() {
    const next = !isFollowing;
    setError(null);
    setIsFollowing(next);

    startTransition(async () => {
      const result = await toggleFollowAction(targetUserId, next);

      if (result.error) {
        setIsFollowing(!next);
        setError(result.error);
      }
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className={[
          'focus-ring rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50',
          isFollowing
            ? 'border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-surface-elevated)]'
            : 'bg-[var(--color-accent)] text-[var(--color-accent-foreground)] hover:bg-[var(--color-accent-hover)]',
        ].join(' ')}
      >
        {isFollowing ? 'Following' : 'Follow'}
      </button>
      {error ? (
        <p className="mt-2 text-sm text-[var(--color-danger)]" role="status">
          {error}
        </p>
      ) : null}
    </div>
  );
}
