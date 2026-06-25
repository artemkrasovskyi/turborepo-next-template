import { prisma } from '@repo/shared/features/database';
import type { FollowListPage } from '@repo/types/features/follow';

type FollowParams = {
  followerId: string;
  followingId: string;
};

type FollowListParams = {
  userId: string;
  viewerId?: string | undefined;
  cursor?: string;
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
  return new Set(rows.map((row) => row.followingId));
}

export function createFollowClient() {
  return {
    async follow({ followerId, followingId }: FollowParams): Promise<{ created: boolean }> {
      const existing = await prisma.follow.findUnique({
        where: { followerId_followingId: { followerId, followingId } },
      });

      if (existing) {
        return { created: false };
      }

      await prisma.follow.create({ data: { followerId, followingId } });
      return { created: true };
    },

    async unfollow({ followerId, followingId }: FollowParams): Promise<void> {
      await prisma.follow.deleteMany({
        where: { followerId, followingId },
      });
    },

    async getFollowers({
      userId,
      viewerId,
      cursor,
      limit,
    }: FollowListParams): Promise<FollowListPage> {
      const pageSize = Math.min(limit ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);

      const follows = await prisma.follow.findMany({
        where: { followingId: userId },
        orderBy: [{ createdAt: 'desc' }, { followerId: 'desc' }],
        take: pageSize + 1,
        ...(cursor
          ? {
              cursor: { followerId_followingId: { followerId: cursor, followingId: userId } },
              skip: 1,
            }
          : {}),
        select: {
          follower: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
        },
      });

      const hasMore = follows.length > pageSize;
      const pageItems = hasMore ? follows.slice(0, pageSize) : follows;
      const users = pageItems.map((followRecord) => followRecord.follower);
      const viewerFollowSet = await batchIsFollowing(
        viewerId,
        users.map((user) => user.id),
      );

      return {
        items: users.map((user) => ({ ...user, isFollowing: viewerFollowSet.has(user.id) })),
        nextCursor: hasMore ? (users[users.length - 1]?.id ?? null) : null,
      };
    },

    async getFollowing({
      userId,
      viewerId,
      cursor,
      limit,
    }: FollowListParams): Promise<FollowListPage> {
      const pageSize = Math.min(limit ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);

      const follows = await prisma.follow.findMany({
        where: { followerId: userId },
        orderBy: [{ createdAt: 'desc' }, { followingId: 'desc' }],
        take: pageSize + 1,
        ...(cursor
          ? {
              cursor: { followerId_followingId: { followerId: userId, followingId: cursor } },
              skip: 1,
            }
          : {}),
        select: {
          following: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
        },
      });

      const hasMore = follows.length > pageSize;
      const pageItems = hasMore ? follows.slice(0, pageSize) : follows;
      const users = pageItems.map((followRecord) => followRecord.following);
      const viewerFollowSet = await batchIsFollowing(
        viewerId,
        users.map((user) => user.id),
      );

      return {
        items: users.map((user) => ({ ...user, isFollowing: viewerFollowSet.has(user.id) })),
        nextCursor: hasMore ? (users[users.length - 1]?.id ?? null) : null,
      };
    },
  };
}
