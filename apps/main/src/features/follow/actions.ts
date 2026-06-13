'use server';

import { revalidatePath } from 'next/cache';
import { createFollowClient } from '@repo/api-client/features/follow';
import type { ToggleFollowResult } from '@repo/types/features/follow';

const followClient = createFollowClient();

export async function toggleFollowAction(
  followerId: string,
  followingId: string,
  nextIsFollowing: boolean,
): Promise<ToggleFollowResult> {
  if (followerId === followingId) {
    return { error: 'You cannot follow yourself.' };
  }

  if (nextIsFollowing) {
    await followClient.follow({ followerId, followingId });
  } else {
    await followClient.unfollow({ followerId, followingId });
  }

  revalidatePath('/profile/[username]', 'page');
  return { isFollowing: nextIsFollowing };
}
