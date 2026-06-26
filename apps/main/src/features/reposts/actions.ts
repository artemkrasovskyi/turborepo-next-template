'use server';

import { createRepostsClient } from '@repo/api-client/features/reposts';
import type { ToggleRepostResult } from '@repo/types/features/reposts';
import { getViewerUser } from '@/features/auth/lib/viewer';

const repostsClient = createRepostsClient();

export const toggleRepostAction = async (
  postId: string,
  nextIsReposted: boolean,
): Promise<ToggleRepostResult> => {
  const viewer = await getViewerUser();
  if (!viewer) {
    return { error: 'You must be signed in to repost.' };
  }

  const userId = viewer.id;

  if (nextIsReposted) {
    await repostsClient.repost({ userId, postId });
  } else {
    await repostsClient.unrepost({ userId, postId });
  }

  return { isReposted: nextIsReposted };
};
