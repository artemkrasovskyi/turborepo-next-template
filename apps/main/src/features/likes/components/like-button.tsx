'use client';

import { useState, useTransition } from 'react';
import { toggleLikeAction } from '../actions';

type LikeButtonProps = {
  viewerId: string | null;
  postId: string;
  initialIsLiked: boolean;
  initialLikeCount: number;
};

export function LikeButton({
  viewerId,
  postId,
  initialIsLiked,
  initialLikeCount,
}: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (viewerId === null) {
    return (
      <span className="text-sm text-slate-500">
        <span aria-hidden="true">{isLiked ? '♥' : '♡'}</span> {likeCount}
        <span className="sr-only"> likes</span>
      </span>
    );
  }

  function handleClick() {
    const next = !isLiked;
    setError(null);
    setIsLiked(next);
    setLikeCount((count) => count + (next ? 1 : -1));

    startTransition(async () => {
      const result = await toggleLikeAction(postId, next);

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
        aria-pressed={isLiked}
        aria-label={`${isLiked ? 'Unlike' : 'Like'} this post, ${likeCount} likes`}
        className={
          isLiked
            ? 'focus-ring rounded text-sm text-rose-600 disabled:opacity-50'
            : 'focus-ring rounded text-sm text-slate-500 hover:text-rose-600 disabled:opacity-50'
        }
      >
        <span aria-hidden="true">{isLiked ? '♥' : '♡'}</span> {likeCount}
      </button>
      {error ? (
        <p className="mt-2 text-sm text-red-600" role="status">
          {error}
        </p>
      ) : null}
    </div>
  );
}
