import { prisma } from '@repo/shared/features/database';
import type { FeedPost } from '@repo/types/features/feed';
import type { FollowListPage, FollowListUser } from '@repo/types/features/follow';

type SearchUsersParams = {
  query: string;
  viewerId?: string | undefined;
  cursor?: string;
  limit?: number;
};

type RecentUsersParams = {
  viewerId?: string | undefined;
  limit?: number;
};

type TrendingPostsParams = {
  viewerId?: string | undefined;
  days?: number;
  limit?: number;
};

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 20;

async function batchIsFollowing(viewerId: string | undefined, ids: string[]): Promise<Set<string>> {
  if (!viewerId || ids.length === 0) {
    return new Set<string>();
  }
  const rows = await prisma.follow.findMany({
    where: { followerId: viewerId, followingId: { in: ids } },
    select: { followingId: true },
  });
  return new Set(rows.map((r) => r.followingId));
}

export function createSearchClient() {
  return {
    async searchUsers({
      query,
      viewerId,
      cursor,
      limit,
    }: SearchUsersParams): Promise<FollowListPage> {
      const pageSize = Math.min(limit ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);

      const users = await prisma.user.findMany({
        where: {
          OR: [
            { username: { contains: query, mode: 'insensitive' } },
            { displayName: { contains: query, mode: 'insensitive' } },
          ],
        },
        orderBy: { createdAt: 'asc' },
        take: pageSize + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        select: { id: true, username: true, displayName: true, avatarUrl: true },
      });

      const hasMore = users.length > pageSize;
      const pageItems = hasMore ? users.slice(0, pageSize) : users;
      const viewerFollowSet = await batchIsFollowing(
        viewerId,
        pageItems.map((u) => u.id),
      );

      return {
        items: pageItems.map((u) => ({ ...u, isFollowing: viewerFollowSet.has(u.id) })),
        nextCursor: hasMore ? (pageItems[pageItems.length - 1]?.id ?? null) : null,
      };
    },

    async getRecentUsers({ viewerId, limit }: RecentUsersParams): Promise<FollowListUser[]> {
      const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit ?? 12,
        select: { id: true, username: true, displayName: true, avatarUrl: true },
      });

      const viewerFollowSet = await batchIsFollowing(
        viewerId,
        users.map((u) => u.id),
      );

      return users.map((u) => ({ ...u, isFollowing: viewerFollowSet.has(u.id) }));
    },

    async getTrendingPosts({ viewerId, days, limit }: TrendingPostsParams): Promise<FeedPost[]> {
      const since = new Date(Date.now() - (days ?? 7) * 24 * 60 * 60 * 1000);

      const posts = await prisma.post.findMany({
        where: { parentId: null, createdAt: { gte: since } },
        orderBy: [{ likes: { _count: 'desc' } }, { createdAt: 'desc' }],
        take: limit ?? 20,
        include: {
          author: {
            select: { id: true, username: true, displayName: true, avatarUrl: true },
          },
          _count: { select: { replies: true, likes: true, reposts: true } },
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
      });

      return posts.map((post) => ({
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
      }));
    },
  };
}
