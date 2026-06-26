'use client';

import { FC, useState } from 'react';
import { Heart } from 'lucide-react';
import { useOptimisticToggle } from '../../../lib/hooks/use-optimistic-toggle';
import { toggleLikeAction } from '../actions';

type LikeButtonProps = {
  viewerId: string | null;
  postId: string;
  initialIsLiked: boolean;
  initialLikeCount: number;
};

export const LikeButton: FC<LikeButtonProps> = ({
  viewerId,
  postId,
  initialIsLiked,
  initialLikeCount,
}) => {
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const {
    value: isLiked,
    error,
    isPending,
    toggle: handleClick,
  } = useOptimisticToggle(initialIsLiked, async (next) => {
    setLikeCount((count) => count + (next ? 1 : -1));
    const result = await toggleLikeAction(postId, next);
    if (result.error) setLikeCount((count) => count + (next ? -1 : 1));
    return result;
  });

  if (viewerId === null) {
    return (
      <span className="flex items-center gap-1.5 text-sm text-[var(--color-text-muted)]">
        <Heart size={16} aria-hidden="true" />
        <span aria-hidden="true">{likeCount}</span>
        <span className="sr-only">{likeCount} likes</span>
      </span>
    );
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
