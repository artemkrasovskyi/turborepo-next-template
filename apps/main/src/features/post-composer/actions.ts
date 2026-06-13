'use server';

import { revalidatePath } from 'next/cache';
import { createPostsClient } from '@repo/api-client/features/posts';
import { MAX_POST_LENGTH } from '@repo/types/features/posts';

const postsClient = createPostsClient();

export type CreatePostResult =
  | { id: string; error?: undefined }
  | { id?: undefined; error: string };

export async function createPostAction(authorId: string, body: string): Promise<CreatePostResult> {
  const trimmed = body.trim();

  if (trimmed.length === 0) {
    return { error: 'Post cannot be empty.' };
  }

  if (trimmed.length > MAX_POST_LENGTH) {
    return { error: `Post must be ${MAX_POST_LENGTH} characters or fewer.` };
  }

  const post = await postsClient.createPost({ authorId, body: trimmed });
  revalidatePath('/');
  return { id: post.id };
}
