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

const IMAGES_INCLUDE = {
  select: { id: true, url: true, order: true },
  orderBy: { order: 'asc' as const },
};

export function createPostsClient() {
  return {
    async createPost({ authorId, body, imageUrls = [] }: CreatePostInput): Promise<{ id: string }> {
      if (imageUrls.length === 0) {
        return prisma.post.create({
          data: { authorId, body, parentId: null },
          select: { id: true },
        });
      }

      return prisma.$transaction(async (tx) => {
        const post = await tx.post.create({
          data: { authorId, body, parentId: null },
          select: { id: true },
        });
        await tx.postImage.createMany({
          data: imageUrls.map((url, order) => ({ postId: post.id, url, order })),
        });
        return post;
      });
    },

    async getThread({
      postId,
      viewerId,
    }: {
      postId: string;
      viewerId?: string | undefined;
    }): Promise<ThreadPage | null> {
      const include = {
        author: { select: AUTHOR_SELECT },
        _count: { select: { likes: true } },
        likes: { where: { userId: viewerId ?? '' }, select: { userId: true }, take: 1 },
        bookmarks: { where: { userId: viewerId ?? '' }, select: { userId: true }, take: 1 },
        images: IMAGES_INCLUDE,
      } as const;

      const root = await prisma.post.findFirst({
        where: { id: postId, parentId: null },
        include,
      });

      if (!root) {
        return null;
      }

      const replies = await prisma.post.findMany({
        where: { parentId: postId },
        orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
        include,
      });

      const toThreadPost = (post: typeof root): ThreadPost => ({
        id: post.id,
        body: post.body,
        createdAt: post.createdAt.toISOString(),
        author: post.author,
        likeCount: post._count.likes,
        isLikedByViewer: post.likes.length > 0,
        isBookmarkedByViewer: post.bookmarks.length > 0,
        images: post.images,
      });

      return { root: toThreadPost(root), replies: replies.map(toThreadPost) };
    },

    async createReply({
      authorId,
      parentId,
      body,
      imageUrls = [],
    }: CreateReplyInput): Promise<{ id: string }> {
      if (imageUrls.length === 0) {
        return prisma.post.create({
          data: { authorId, parentId, body },
          select: { id: true },
        });
      }

      return prisma.$transaction(async (tx) => {
        const post = await tx.post.create({
          data: { authorId, parentId, body },
          select: { id: true },
        });
        await tx.postImage.createMany({
          data: imageUrls.map((url, order) => ({ postId: post.id, url, order })),
        });
        return post;
      });
    },
  };
}
