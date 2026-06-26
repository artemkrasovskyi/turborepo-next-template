'use server';

import { createBookmarksClient } from '@repo/api-client/features/bookmarks';
import type { FeedPage } from '@repo/types/features/feed';
import type { ToggleBookmarkResult } from '@repo/types/features/bookmarks';
import { getViewerUser } from '@/features/auth/lib/viewer';

const bookmarksClient = createBookmarksClient();

export const toggleBookmarkAction = async (
  postId: string,
  nextIsBookmarked: boolean,
): Promise<ToggleBookmarkResult> => {
  const viewer = await getViewerUser();
  if (!viewer) {
    return {
      isBookmarked: !nextIsBookmarked,
      error: 'You must be signed in to bookmark posts.',
    };
  }

  const userId = viewer.id;

  if (nextIsBookmarked) {
    await bookmarksClient.bookmark({ userId, postId });
  } else {
    await bookmarksClient.unbookmark({ userId, postId });
  }

  return { isBookmarked: nextIsBookmarked };
};

export const loadMoreBookmarkedPostsAction = async (cursor: string): Promise<FeedPage> => {
  const viewer = await getViewerUser();
  if (!viewer) {
    return { items: [], nextCursor: null };
  }

  const userId = viewer.id;
  return bookmarksClient.getBookmarkedPosts({ userId, viewerId: userId, cursor });
};
