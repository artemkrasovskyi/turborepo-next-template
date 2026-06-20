'use client';

import { useState, useTransition } from 'react';
import { Repeat2 } from 'lucide-react';
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
      <span className="flex items-center gap-1.5 text-sm text-[var(--color-text-muted)]">
        <Repeat2 size={16} aria-hidden="true" />
        <span aria-hidden="true">{repostCount}</span>
        <span className="sr-only">{repostCount} reposts</span>
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
