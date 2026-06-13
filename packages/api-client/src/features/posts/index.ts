import { prisma } from '@repo/shared/features/database';
import type {
  CreatePostInput,
  CreateReplyInput,
  ThreadPage,
  ThreadPost,
} from '@repo/types/features/posts';

const AUTHOR_SELECT = {
  id: true,
  username: true,
  displayName: true,
  avatarUrl: true,
} as const;

export function createPostsClient() {
  return {
    async createPost({ authorId, body }: CreatePostInput): Promise<{ id: string }> {
      return prisma.post.create({
        data: { authorId, body, parentId: null },
        select: { id: true },
      });
    },

    async getThread({ postId }: { postId: string }): Promise<ThreadPage | null> {
      const root = await prisma.post.findFirst({
        where: { id: postId, parentId: null },
        include: { author: { select: AUTHOR_SELECT } },
      });

      if (!root) {
        return null;
      }

      const replies = await prisma.post.findMany({
        where: { parentId: postId },
        orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
        include: { author: { select: AUTHOR_SELECT } },
      });

      const toThreadPost = (post: typeof root): ThreadPost => ({
        id: post.id,
        body: post.body,
        createdAt: post.createdAt.toISOString(),
        author: post.author,
      });

      return { root: toThreadPost(root), replies: replies.map(toThreadPost) };
    },

    async createReply({ authorId, parentId, body }: CreateReplyInput): Promise<{ id: string }> {
      return prisma.post.create({
        data: { authorId, parentId, body },
        select: { id: true },
      });
    },
  };
}
