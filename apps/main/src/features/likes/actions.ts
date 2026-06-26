'use server';

import { createLikesClient } from '@repo/api-client/features/likes';
import { createNotificationsClient } from '@repo/api-client/features/notifications';
import type { FeedPage } from '@repo/types/features/feed';
import type { ToggleLikeResult } from '@repo/types/features/likes';
import { getViewerUser } from '@/features/auth/lib/viewer';

const likesClient = createLikesClient();
const notificationsClient = createNotificationsClient();

export const toggleLikeAction = async (
  postId: string,
  nextIsLiked: boolean,
): Promise<ToggleLikeResult> => {
  const viewer = await getViewerUser();
  if (!viewer) {
    return { error: 'You must be signed in to like posts.' };
  }

  const userId = viewer.id;

  if (nextIsLiked) {
    const { created } = await likesClient.like({ userId, postId });
    if (created) {
      await notificationsClient.notifyLike({ actorId: userId, postId });
    }
  } else {
    await likesClient.unlike({ userId, postId });
  }

  return { isLiked: nextIsLiked };
};

export const loadMoreLikedPostsAction = async (
  userId: string,
  cursor: string,
  viewerId?: string,
): Promise<FeedPage> => likesClient.getLikedPosts({ userId, cursor, ...(viewerId ? { viewerId } : {}) });
