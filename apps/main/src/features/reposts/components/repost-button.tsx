'use client';

import { FC, useState } from 'react';
import { Repeat2 } from 'lucide-react';
import { useOptimisticToggle } from '../../../lib/hooks/use-optimistic-toggle';
import { toggleRepostAction } from '../actions';

type RepostButtonProps = {
  viewerId: string | null;
  postId: string;
  initialIsReposted: boolean;
  initialRepostCount: number;
};

export const RepostButton: FC<RepostButtonProps> = ({
  viewerId,
  postId,
  initialIsReposted,
  initialRepostCount,
}) => {
  const [repostCount, setRepostCount] = useState(initialRepostCount);
  const {
    value: isReposted,
    error,
    isPending,
    toggle: handleClick,
  } = useOptimisticToggle(initialIsReposted, async (next) => {
    setRepostCount((count) => count + (next ? 1 : -1));
    const result = await toggleRepostAction(postId, next);
    if (result.error) setRepostCount((count) => count + (next ? -1 : 1));
    return result;
  });

  if (viewerId === null) {
    return (
      <span className="flex items-center gap-1.5 text-sm text-[var(--color-text-muted)]">
        <Repeat2 size={16} aria-hidden="true" />
        <span aria-hidden="true">{repostCount}</span>
        <span className="sr-only">{repostCount} reposts</span>
      </span>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        aria-pressed={isReposted}
        aria-label={`${isReposted ? 'Undo repost' : 'Repost'} this post, ${repostCount} reposts`}
        className={[
          'focus-ring flex items-center gap-1.5 rounded text-sm disabled:opacity-50',
          isReposted
            ? 'text-[var(--color-accent)]'
            : 'text-[var(--color-text-muted)] hover:text-[var(--color-accent)]',
        ].join(' ')}
      >
        <Repeat2 size={16} aria-hidden="true" />
        <span aria-hidden="true">{repostCount}</span>
      </button>
      {error ? (
        <p className="mt-1 text-xs text-[var(--color-danger)]" role="status">
          {error}
        </p>
      ) : null}
    </div>
  );
}
