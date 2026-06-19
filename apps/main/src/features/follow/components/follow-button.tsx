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
        className={
          isFollowing
            ? 'focus-ring rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50'
            : 'focus-ring rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 disabled:opacity-50'
        }
      >
        {isFollowing ? 'Following' : 'Follow'}
      </button>
      {error ? (
        <p className="mt-2 text-sm text-red-600" role="status">
          {error}
        </p>
      ) : null}
    </div>
  );
}
