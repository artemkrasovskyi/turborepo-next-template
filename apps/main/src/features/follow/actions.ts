'use server';

import { revalidatePath } from 'next/cache';
import { createFollowClient } from '@repo/api-client/features/follow';
import { createNotificationsClient } from '@repo/api-client/features/notifications';
import type { FollowListPage, ToggleFollowResult } from '@repo/types/features/follow';
import { getViewerUser } from '@/features/auth/lib/viewer';

const followClient = createFollowClient();
const notificationsClient = createNotificationsClient();

export const toggleFollowAction = async (
  followingId: string,
  nextIsFollowing: boolean,
): Promise<ToggleFollowResult> => {
  const viewer = await getViewerUser();
  if (!viewer) {
    return { error: 'You must be signed in to follow people.' };
  }

  const followerId = viewer.id;

  if (followerId === followingId) {
    return { error: 'You cannot follow yourself.' };
  }

  if (nextIsFollowing) {
    const { created } = await followClient.follow({ followerId, followingId });
    if (created) {
      await notificationsClient.notifyFollow({ recipientId: followingId, actorId: followerId });
    }
  } else {
    await followClient.unfollow({ followerId, followingId });
  }

  revalidatePath('/profile/[username]', 'page');
  return { isFollowing: nextIsFollowing };
};

export const loadMoreFollowersAction = async (
  userId: string,
  cursor: string,
  viewerId?: string,
): Promise<FollowListPage> => followClient.getFollowers({ userId, viewerId, cursor });

export const loadMoreFollowingAction = async (
  userId: string,
  cursor: string,
  viewerId?: string,
): Promise<FollowListPage> => followClient.getFollowing({ userId, viewerId, cursor });
