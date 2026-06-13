'use client';

import { useState, useTransition } from 'react';
import { toggleLikeAction } from '../actions';

type LikeButtonProps = {
  viewerId: string | null;
  postId: string;
  initialIsLiked: boolean;
  initialLikeCount: number;
};

export function LikeButton({ viewerId, postId, initialIsLiked, initialLikeCount }: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (viewerId === null) {
    return (
      <span className="text-sm text-slate-500">
        {isLiked ? '♥' : '♡'} {likeCount}
      </span>
    );
  }

  const currentViewerId = viewerId;

  function handleClick() {
    const next = !isLiked;
    setError(null);
    setIsLiked(next);
    setLikeCount((count) => count + (next ? 1 : -1));

    startTransition(async () => {
      const result = await toggleLikeAction(currentViewerId, postId, next);

      if (result.error) {
        setIsLiked(!next);
        setLikeCount((count) => count + (next ? -1 : 1));
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
          isLiked
            ? 'text-sm text-rose-600 disabled:opacity-50'
            : 'text-sm text-slate-500 hover:text-rose-600 disabled:opacity-50'
        }
      >
        {isLiked ? '♥' : '♡'} {likeCount}
      </button>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
