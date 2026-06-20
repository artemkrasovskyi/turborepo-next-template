'use client';

import { useState, useTransition } from 'react';
import { Heart } from 'lucide-react';
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
      <span className="flex items-center gap-1.5 text-sm text-[var(--color-text-muted)]">
        <Heart size={16} aria-hidden="true" />
        <span aria-hidden="true">{likeCount}</span>
        <span className="sr-only">{likeCount} likes</span>
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
        className={[
          'focus-ring flex items-center gap-1.5 rounded text-sm disabled:opacity-50',
          isLiked
            ? 'text-[var(--color-danger)]'
            : 'text-[var(--color-text-muted)] hover:text-[var(--color-danger)]',
        ].join(' ')}
      >
        <Heart size={16} aria-hidden="true" fill={isLiked ? 'currentColor' : 'none'} />
        <span aria-hidden="true">{likeCount}</span>
      </button>
      {error ? (
        <p className="mt-1 text-xs text-[var(--color-danger)]" role="status">
          {error}
        </p>
      ) : null}
    </div>
  );
}
