'use client';

import { Bookmark } from 'lucide-react';
import { useOptimisticToggle } from '../../../lib/hooks/use-optimistic-toggle';
import { toggleBookmarkAction } from '../actions';

type BookmarkButtonProps = {
  viewerId: string | null;
  postId: string;
  initialIsBookmarked: boolean;
};

export function BookmarkButton({ viewerId, postId, initialIsBookmarked }: BookmarkButtonProps) {
  const {
    value: isBookmarked,
    error,
    isPending,
    toggle: handleClick,
  } = useOptimisticToggle(initialIsBookmarked, (next) => toggleBookmarkAction(postId, next));

  if (viewerId === null) {
    return (
      <span className="flex items-center gap-1.5 text-sm text-[var(--color-text-muted)]">
        <Bookmark size={16} aria-hidden="true" />
        <span className="sr-only">{isBookmarked ? 'Saved' : 'Not saved'}</span>
      </span>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        aria-pressed={isBookmarked}
        aria-label={isBookmarked ? 'Remove post from bookmarks' : 'Save post to bookmarks'}
        className={[
          'focus-ring flex items-center gap-1.5 rounded text-sm disabled:opacity-50',
          isBookmarked
            ? 'text-[var(--color-accent)]'
            : 'text-[var(--color-text-muted)] hover:text-[var(--color-accent)]',
        ].join(' ')}
      >
        <Bookmark size={16} aria-hidden="true" fill={isBookmarked ? 'currentColor' : 'none'} />
        <span>{isBookmarked ? 'Saved' : 'Save'}</span>
      </button>
      {error ? (
        <p className="mt-1 text-xs text-[var(--color-danger)]" role="status">
          {error}
        </p>
      ) : null}
    </div>
  );
}
