'use client';

import { useState, useTransition } from 'react';
import { toggleRepostAction } from '../actions';

type RepostButtonProps = {
  viewerId: string | null;
  postId: string;
  initialIsReposted: boolean;
  initialRepostCount: number;
};

export function RepostButton({
  viewerId,
  postId,
  initialIsReposted,
  initialRepostCount,
}: RepostButtonProps) {
  const [isReposted, setIsReposted] = useState(initialIsReposted);
  const [repostCount, setRepostCount] = useState(initialRepostCount);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (viewerId === null) {
    return (
      <span className="text-sm text-slate-500">
        <span aria-hidden="true">↻</span> {repostCount}
        <span className="sr-only"> reposts</span>
      </span>
    );
  }

  function handleClick() {
    const next = !isReposted;
    setError(null);
    setIsReposted(next);
    setRepostCount((count) => count + (next ? 1 : -1));

    startTransition(async () => {
      const result = await toggleRepostAction(postId, next);

      if (result.error) {
        setIsReposted(!next);
        setRepostCount((count) => count + (next ? -1 : 1));
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
        aria-pressed={isReposted}
        aria-label={`${isReposted ? 'Undo repost' : 'Repost'} this post, ${repostCount} reposts`}
        className={
          isReposted
            ? 'focus-ring rounded text-sm text-teal-600 disabled:opacity-50'
            : 'focus-ring rounded text-sm text-slate-500 hover:text-teal-600 disabled:opacity-50'
        }
      >
        <span aria-hidden="true">↻</span> {repostCount}
      </button>
      {error ? (
        <p className="mt-2 text-sm text-red-600" role="status">
          {error}
        </p>
      ) : null}
    </div>
  );
}
