'use client';

import { useState, useTransition } from 'react';
import { toggleBookmarkAction } from '../actions';

type BookmarkButtonProps = {
  viewerId: string | null;
  postId: string;
  initialIsBookmarked: boolean;
};

export function BookmarkButton({
  viewerId,
  postId,
  initialIsBookmarked,
}: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (viewerId === null) {
    return (
      <span className="text-sm text-slate-500">
        <span aria-hidden="true">{isBookmarked ? '★' : '☆'}</span>
        <span className="sr-only">{isBookmarked ? ' saved' : ' not saved'}</span>
      </span>
    );
  }

  function handleClick() {
    const next = !isBookmarked;
    setError(null);
    setIsBookmarked(next);

    startTransition(async () => {
      const result = await toggleBookmarkAction(postId, next);

      if (result.error) {
        setIsBookmarked(!next);
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
        aria-pressed={isBookmarked}
        aria-label={isBookmarked ? 'Remove post from bookmarks' : 'Save post to bookmarks'}
        className={
          isBookmarked
            ? 'focus-ring rounded text-sm text-teal-700 disabled:opacity-50'
            : 'focus-ring rounded text-sm text-slate-500 hover:text-teal-700 disabled:opacity-50'
        }
      >
        <span aria-hidden="true">{isBookmarked ? '★' : '☆'}</span>{' '}
        {isBookmarked ? 'Saved' : 'Save'}
      </button>
      {error ? (
        <p className="mt-2 text-sm text-red-600" role="status">
          {error}
        </p>
      ) : null}
    </div>
  );
}
