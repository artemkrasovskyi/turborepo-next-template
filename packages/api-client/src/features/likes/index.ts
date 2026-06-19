import { prisma } from '@repo/shared/features/database';
import type { FeedPage } from '@repo/types/features/feed';

type LikeParams = {
  userId: string;
  postId: string;
};

type GetLikedPostsParams = {
  userId: string;
  viewerId?: string;
  cursor?: string;
  limit?: number;
};

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 20;

export function createLikesClient() {
  return {
    async like({ userId, postId }: LikeParams): Promise<{ created: boolean }> {
      const existing = await prisma.like.findUnique({
        where: { userId_postId: { userId, postId } },
      });

      if (existing) {
        return { created: false };
      }

      await prisma.like.create({ data: { userId, postId } });
      return { created: true };
    },

    async unlike({ userId, postId }: LikeParams): Promise<void> {
      await prisma.like.deleteMany({
        where: { userId, postId },
      });
    },

    async getLikedPosts({ userId, viewerId, cursor, limit }: GetLikedPostsParams): Promise<FeedPage> {
      const pageSize = Math.min(limit ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);

      const likes = await prisma.like.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: pageSize + 1,
        ...(cursor
          ? { cursor: { userId_postId: { userId, postId: cursor } }, skip: 1 }
          : {}),
        include: {
          post: {
            include: {
              author: {
                select: {
                  id: true,
                  username: true,
                  displayName: true,
                  avatarUrl: true,
                },
              },
              _count: {
                select: { replies: true, likes: true, reposts: true },
              },
              likes: {
                where: { userId: viewerId ?? '' },
                select: { userId: true },
                take: 1,
              },
              reposts: {
                where: { userId: viewerId ?? '' },
                select: { userId: true },
                take: 1,
              },
              bookmarks: {
                where: { userId: viewerId ?? '' },
                select: { userId: true },
                take: 1,
              },
              images: {
                select: { id: true, url: true, order: true },
                orderBy: { order: 'asc' as const },
              },
            },
          },
        },
      });

      const hasMore = likes.length > pageSize;
      const pageItems = hasMore ? likes.slice(0, pageSize) : likes;

      return {
        items: pageItems.map(({ post }) => ({
          id: post.id,
          body: post.body,
          createdAt: post.createdAt.toISOString(),
          author: post.author,
          replyCount: post._count.replies,
          likeCount: post._count.likes,
          isLikedByViewer: post.likes.length > 0,
          repostCount: post._count.reposts,
          isRepostedByViewer: post.reposts.length > 0,
          isBookmarkedByViewer: post.bookmarks.length > 0,
          images: post.images,
        })),
        nextCursor: hasMore ? (pageItems[pageItems.length - 1]?.post.id ?? null) : null,
      };
    },
  };
}
