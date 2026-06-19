'use server';

import { revalidatePath } from 'next/cache';
import { createPostsClient } from '@repo/api-client/features/posts';
import { validatePostBody } from '@repo/types/features/posts';
import { getViewerUser } from '@/features/auth/lib/viewer';

const postsClient = createPostsClient();

export type CreateReplyResult =
  | { id: string; error?: undefined }
  | { id?: undefined; error: string };

export async function createReplyAction(
  parentId: string,
  body: string,
  imageUrls: string[] = [],
): Promise<CreateReplyResult> {
  const viewer = await getViewerUser();
  if (!viewer) {
    return { error: 'You must be signed in to reply.' };
  }

  const result = validatePostBody(body, 'Reply', undefined, imageUrls.length);

  if (result.error !== undefined) {
    return { error: result.error };
  }

  const reply = await postsClient.createReply({
    authorId: viewer.id,
    parentId,
    body: result.trimmed,
    imageUrls,
  });
  revalidatePath(`/posts/${parentId}`);
  return { id: reply.id };
}
