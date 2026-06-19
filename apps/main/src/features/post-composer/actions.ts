'use server';

import { revalidatePath } from 'next/cache';
import { createPostsClient } from '@repo/api-client/features/posts';
import { validatePostBody } from '@repo/types/features/posts';

const postsClient = createPostsClient();

export type CreatePostResult =
  | { id: string; error?: undefined }
  | { id?: undefined; error: string };

export async function createPostAction(
  authorId: string,
  body: string,
  imageUrls: string[] = [],
): Promise<CreatePostResult> {
  const result = validatePostBody(body, 'Post', undefined, imageUrls.length);

  if (result.error !== undefined) {
    return { error: result.error };
  }

  const post = await postsClient.createPost({ authorId, body: result.trimmed, imageUrls });
  revalidatePath('/');
  return { id: post.id };
}
