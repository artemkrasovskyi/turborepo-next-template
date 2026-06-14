'use server';

import { revalidatePath } from 'next/cache';
import { createPostsClient } from '@repo/api-client/features/posts';
import { validatePostBody } from '@repo/types/features/posts';

const postsClient = createPostsClient();

export type CreateReplyResult =
  | { id: string; error?: undefined }
  | { id?: undefined; error: string };

export async function createReplyAction(
  authorId: string,
  parentId: string,
  body: string,
): Promise<CreateReplyResult> {
  const result = validatePostBody(body, 'Reply');

  if (result.error !== undefined) {
    return { error: result.error };
  }

  const reply = await postsClient.createReply({ authorId, parentId, body: result.trimmed });
  revalidatePath(`/posts/${parentId}`);
  return { id: reply.id };
}
