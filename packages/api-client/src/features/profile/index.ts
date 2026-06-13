import { prisma } from '@repo/shared/features/database';
import type { ProfileUser } from '@repo/types/features/profile';
import type { FeedPage } from '@repo/types/features/feed';

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 20;

type GetProfilePostsParams = {
  userId: string;
  viewerId?: string | undefined;
  cursor?: string;
  limit?: number;
};

export function createProfileClient() {
  return {
    async getProfileByUsername(username: string, viewerId?: string): Promise<ProfileUser | null> {
      const user = await prisma.user.findUnique({
        where: { username },
        select: {
          id: true,
          username: true,
          displayName: true,
          bio: true,
          avatarUrl: true,
          createdAt: true,
          _count: { select: { followers: true, following: true } },
        },
      });

      if (!user) {
        return null;
      }

      const isFollowing =
        viewerId !== undefined
          ? (await prisma.follow.findUnique({
              where: { followerId_followingId: { followerId: viewerId, followingId: user.id } },
            })) !== null
          : false;

      return {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt.toISOString(),
        followerCount: user._count.followers,
        followingCount: user._count.following,
        isFollowing,
      };
    },

    async getProfilePosts({
      userId,
      viewerId,
      cursor,
      limit,
    }: GetProfilePostsParams): Promise<FeedPage> {
      const pageSize = Math.min(limit ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);

      const posts = await prisma.post.findMany({
        where: {
          parentId: null,
          authorId: userId,
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
          _count: {
            select: { replies: true, likes: true },
          },
          likes: {
            where: { userId: viewerId ?? '' },
            select: { userId: true },
            take: 1,
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
          replyCount: post._count.replies,
          likeCount: post._count.likes,
          isLikedByViewer: post.likes.length > 0,
        })),
        nextCursor: hasMore ? (pageItems[pageItems.length - 1]?.id ?? null) : null,
      };
    },
  };
}
