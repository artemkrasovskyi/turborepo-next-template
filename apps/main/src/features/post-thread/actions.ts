'use server';

import { revalidatePath } from 'next/cache';
import { createPostsClient } from '@repo/api-client/features/posts';
import { MAX_POST_LENGTH } from '@repo/types/features/posts';

const postsClient = createPostsClient();

export type CreateReplyResult =
  | { id: string; error?: undefined }
  | { id?: undefined; error: string };

export async function createReplyAction(
  authorId: string,
  parentId: string,
  body: string,
): Promise<CreateReplyResult> {
  const trimmed = body.trim();

  if (trimmed.length === 0) {
    return { error: 'Reply cannot be empty.' };
  }

  if (trimmed.length > MAX_POST_LENGTH) {
    return { error: `Reply must be ${MAX_POST_LENGTH} characters or fewer.` };
  }

  const reply = await postsClient.createReply({ authorId, parentId, body: trimmed });
  revalidatePath(`/posts/${parentId}`);
  return { id: reply.id };
}
