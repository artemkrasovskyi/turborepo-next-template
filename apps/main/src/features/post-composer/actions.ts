'use server';

import { revalidatePath } from 'next/cache';
import { createPostsClient } from '@repo/api-client/features/posts';
import { validatePostBody } from '@repo/types/features/posts';
import { getViewerUser } from '@/features/auth/lib/viewer';

const postsClient = createPostsClient();

export type CreatePostResult =
  | { id: string; error?: undefined }
  | { id?: undefined; error: string };

export const createPostAction = async (
  body: string,
  imageUrls: string[] = [],
): Promise<CreatePostResult> => {
  const viewer = await getViewerUser();
  if (!viewer) {
    return { error: 'You must be signed in to post.' };
  }

  const result = validatePostBody(body, 'Post', undefined, imageUrls.length);

  if (result.error !== undefined) {
    return { error: result.error };
  }

  const post = await postsClient.createPost({ authorId: viewer.id, body: result.trimmed, imageUrls });
  revalidatePath('/');
  return { id: post.id };
};
