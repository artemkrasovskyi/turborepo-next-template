import { prisma } from '@repo/shared/features/database';
import type { FeedPage } from '@repo/types/features/feed';

type BookmarkParams = {
  userId: string;
  postId: string;
};

type GetBookmarkedPostsParams = {
  userId: string;
  viewerId?: string;
  cursor?: string;
  limit?: number;
};

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 20;

export function createBookmarksClient() {
  return {
    async bookmark({ userId, postId }: BookmarkParams): Promise<{ created: boolean }> {
      const existing = await prisma.bookmark.findUnique({
        where: { userId_postId: { userId, postId } },
      });

      if (existing) {
        return { created: false };
      }

      await prisma.bookmark.create({ data: { userId, postId } });
      return { created: true };
    },

    async unbookmark({ userId, postId }: BookmarkParams): Promise<void> {
      await prisma.bookmark.deleteMany({
        where: { userId, postId },
      });
    },

    async getBookmarkedPosts({
      userId,
      viewerId,
      cursor,
      limit,
    }: GetBookmarkedPostsParams): Promise<FeedPage> {
      const pageSize = Math.min(limit ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);

      const bookmarks = await prisma.bookmark.findMany({
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

      const hasMore = bookmarks.length > pageSize;
      const pageItems = hasMore ? bookmarks.slice(0, pageSize) : bookmarks;

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
