'use server';

import { createProfileClient } from '@repo/api-client/features/profile';
import type { FeedPage } from '@repo/types/features/feed';

const profileClient = createProfileClient();

export async function loadMoreProfilePostsAction(
  userId: string,
  cursor: string,
): Promise<FeedPage> {
  return profileClient.getProfilePosts({ userId, cursor });
}
