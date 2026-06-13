import { prisma } from '@repo/shared/features/database';
import type { CreatePostInput } from '@repo/types/features/posts';

export function createPostsClient() {
  return {
    async createPost({ authorId, body }: CreatePostInput): Promise<{ id: string }> {
      return prisma.post.create({
        data: { authorId, body, parentId: null },
        select: { id: true },
      });
    },
  };
}
