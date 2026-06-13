'use server';

import { revalidatePath } from 'next/cache';
import { createFollowClient } from '@repo/api-client/features/follow';
import { createNotificationsClient } from '@repo/api-client/features/notifications';
import type { ToggleFollowResult } from '@repo/types/features/follow';

const followClient = createFollowClient();
const notificationsClient = createNotificationsClient();

export async function toggleFollowAction(
  followerId: string,
  followingId: string,
  nextIsFollowing: boolean,
): Promise<ToggleFollowResult> {
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
}
