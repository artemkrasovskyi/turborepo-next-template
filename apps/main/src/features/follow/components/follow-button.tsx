'use client';

import { FC } from 'react';
import { useOptimisticToggle } from '../../../lib/hooks/use-optimistic-toggle';
import { toggleFollowAction } from '../actions';

type FollowButtonProps = {
  viewerId: string;
  targetUserId: string;
  initialIsFollowing: boolean;
};

export const FollowButton: FC<FollowButtonProps> = ({ viewerId, targetUserId, initialIsFollowing }) => {
  const {
    value: isFollowing,
    error,
    isPending,
    toggle: handleClick,
  } = useOptimisticToggle(initialIsFollowing, (next) => toggleFollowAction(targetUserId, next));

  if (viewerId === targetUserId) {
    return null;
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
