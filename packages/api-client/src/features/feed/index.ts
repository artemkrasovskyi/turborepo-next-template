import { prisma } from '@repo/shared/features/database';
import type { FeedPage } from '@repo/types/features/feed';

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 20;

type GetHomeFeedParams = {
  viewerId: string;
  cursor?: string;
  limit?: number;
};

export function createFeedClient() {
  return {
    async getHomeFeed({ viewerId, cursor, limit }: GetHomeFeedParams): Promise<FeedPage> {
      const pageSize = Math.min(limit ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);

      const follows = await prisma.follow.findMany({
        where: { followerId: viewerId },
        select: { followingId: true },
      });

      const authorIds = [...follows.map((follow) => follow.followingId), viewerId];

      const posts = await prisma.post.findMany({
        where: {
          parentId: null,
          authorId: { in: authorIds },
        },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: pageSize + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        include: {
          author: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
            },
          },
        },
      });

      const hasMore = posts.length > pageSize;
      const pageItems = hasMore ? posts.slice(0, pageSize) : posts;

      return {
        items: pageItems.map((post) => ({
          id: post.id,
          body: post.body,
          createdAt: post.createdAt.toISOString(),
          author: post.author,
        })),
        nextCursor: hasMore ? (pageItems[pageItems.length - 1]?.id ?? null) : null,
      };
    },
  };
}
