'use server';

import { revalidatePath } from 'next/cache';
import { createProfileClient } from '@repo/api-client/features/profile';
import type { FeedPage } from '@repo/types/features/feed';
import { validateProfileInput } from '@repo/types/features/profile';

const profileClient = createProfileClient();

export async function loadMoreProfilePostsAction(
  userId: string,
  cursor: string,
  viewerId?: string | undefined,
): Promise<FeedPage> {
  return profileClient.getProfilePosts({ userId, viewerId, cursor });
}

export type UpdateProfileResult = { ok: true; error?: undefined } | { ok?: undefined; error: string };

export async function updateProfileAction(
  userId: string,
  username: string,
  displayName: string,
  bio: string | null,
  avatarUrl: string | null,
): Promise<UpdateProfileResult> {
  const result = validateProfileInput({ userId, displayName, bio, avatarUrl });

  if (result.error !== undefined) {
    return { error: result.error };
  }

  await profileClient.updateProfile({
    userId,
    displayName: result.displayName,
    bio: result.bio,
    avatarUrl: result.avatarUrl,
  });

  revalidatePath(`/profile/${username}`);
  return { ok: true };
}
