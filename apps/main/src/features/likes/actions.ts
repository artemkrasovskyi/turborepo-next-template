'use server';

import { createLikesClient } from '@repo/api-client/features/likes';
import { createNotificationsClient } from '@repo/api-client/features/notifications';
import type { ToggleLikeResult } from '@repo/types/features/likes';

const likesClient = createLikesClient();
const notificationsClient = createNotificationsClient();

export async function toggleLikeAction(
  userId: string,
  postId: string,
  nextIsLiked: boolean,
): Promise<ToggleLikeResult> {
  if (nextIsLiked) {
    const { created } = await likesClient.like({ userId, postId });
    if (created) {
      await notificationsClient.notifyLike({ actorId: userId, postId });
    }
  } else {
    await likesClient.unlike({ userId, postId });
  }

  return { isLiked: nextIsLiked };
}
