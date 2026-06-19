import { prisma } from '@repo/shared/features/database';
import type { FeedPage, FeedPost } from '@repo/types/features/feed';
import type { FollowListPage, FollowListUser } from '@repo/types/features/follow';

type GetSuggestedUsersParams = {
  viewerId?: string | undefined;
  cursor?: string;
  limit?: number;
};

type GetRecommendedPostsParams = {
  viewerId?: string | undefined;
  cursor?: string;
  limit?: number;
};

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 20;

// Suggested user ranking weights
const SUGGESTED_USER_WEIGHTS = {
  mutualFollowedBy: 100,
  followerCount: 3,
  recentPostCount7d: 5,
  accountRecencyBoostMax: 10,
};

// Recommended post ranking weights
const RECOMMENDED_POST_WEIGHTS = {
  followedUserEngagement: 80,
  authorFollowedByFollowed: 50,
  likeCount: 4,
  repostCount: 8,
  replyCount: 2,
  recencyBoostMax7d: 30,
};

export function scoreSuggestedUser(
  mutualFollowedByCount: number,
  followerCount: number,
  recentPostCount7d: number,
  accountAgeDays: number,
): number {
  const recencyBoost =
    accountAgeDays <= 30
      ? Math.floor(
          (SUGGESTED_USER_WEIGHTS.accountRecencyBoostMax * (30 - accountAgeDays)) / 30,
        )
      : 0;
  return (
    mutualFollowedByCount * SUGGESTED_USER_WEIGHTS.mutualFollowedBy +
    followerCount * SUGGESTED_USER_WEIGHTS.followerCount +
    recentPostCount7d * SUGGESTED_USER_WEIGHTS.recentPostCount7d +
    recencyBoost
  );
}

export function scoreRecommendedPost(
  followedUserEngagementCount: number,
  authorFollowedByFollowedUsersCount: number,
  likeCount: number,
  repostCount: number,
  replyCount: number,
  postAgeDays: number,
): number {
  const recencyBoost =
    postAgeDays <= 7
      ? Math.floor(
          (RECOMMENDED_POST_WEIGHTS.recencyBoostMax7d * (7 - postAgeDays)) / 7,
        )
      : 0;
  return (
    followedUserEngagementCount * RECOMMENDED_POST_WEIGHTS.followedUserEngagement +
    authorFollowedByFollowedUsersCount * RECOMMENDED_POST_WEIGHTS.authorFollowedByFollowed +
    likeCount * RECOMMENDED_POST_WEIGHTS.likeCount +
    repostCount * RECOMMENDED_POST_WEIGHTS.repostCount +
    replyCount * RECOMMENDED_POST_WEIGHTS.replyCount +
    recencyBoost
  );
}

export function createRecommendationsClient() {
  return {
    async getSuggestedUsers({
      viewerId,
      cursor,
      limit,
    }: GetSuggestedUsersParams): Promise<FollowListPage> {
      const pageSize = Math.min(limit ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // IDs to exclude: viewer + already followed
      const alreadyFollowedIds = viewerId
        ? (
            await prisma.follow.findMany({
              where: { followerId: viewerId },
              select: { followingId: true },
            })
          ).map((f) => f.followingId)
        : [];

      const excludeIds = viewerId ? [viewerId, ...alreadyFollowedIds] : [];

      // Candidate 1: users followed by people the viewer follows (social proximity)
      const socialProximityCandidateIds = viewerId
        ? (
            await prisma.follow.findMany({
              where: {
                followerId: { in: alreadyFollowedIds },
                followingId: { notIn: excludeIds },
              },
              select: { followingId: true },
              distinct: ['followingId'],
              take: 200,
            })
          ).map((f) => f.followingId)
        : [];

      // Candidate 2: recently active users
      const recentlyActiveIds = (
        await prisma.user.findMany({
          where: {
            id: { notIn: excludeIds },
            posts: { some: { createdAt: { gte: sevenDaysAgo }, parentId: null } },
          },
          select: { id: true },
          take: 100,
        })
      ).map((u) => u.id);

      // Candidate 3: recently joined users as fallback
      const recentlyJoinedIds = (
        await prisma.user.findMany({
          where: { id: { notIn: excludeIds }, createdAt: { gte: thirtyDaysAgo } },
          orderBy: { createdAt: 'desc' },
          select: { id: true },
          take: 50,
        })
      ).map((u) => u.id);

      const allCandidateIds = [
        ...new Set([...socialProximityCandidateIds, ...recentlyActiveIds, ...recentlyJoinedIds]),
      ];

      if (allCandidateIds.length === 0) {
        return { items: [], nextCursor: null };
      }

      // Fetch candidates with all data needed for scoring
      const candidates = await prisma.user.findMany({
        where: { id: { in: allCandidateIds } },
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
          createdAt: true,
          _count: {
            select: {
              followers: true,
              posts: {
                where: { createdAt: { gte: sevenDaysAgo }, parentId: null },
              },
            },
          },
        },
      });

      // Count how many of the viewer's followed users also follow each candidate
      const mutualFollowCounts = new Map<string, number>();
      if (alreadyFollowedIds.length > 0) {
        const mutualRows = await prisma.follow.groupBy({
          by: ['followingId'],
          where: {
            followerId: { in: alreadyFollowedIds },
            followingId: { in: allCandidateIds },
          },
          _count: { followingId: true },
        });
        mutualRows.forEach((row) => {
          mutualFollowCounts.set(row.followingId, row._count.followingId);
        });
      }

      // Score and sort
      const scored = candidates
        .map((u) => {
          const accountAgeDays = Math.floor(
            (now.getTime() - u.createdAt.getTime()) / (1000 * 60 * 60 * 24),
          );
          const score = scoreSuggestedUser(
            mutualFollowCounts.get(u.id) ?? 0,
            u._count.followers,
            u._count.posts,
            accountAgeDays,
          );
          return { ...u, score };
        })
        .sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          if (b.createdAt.getTime() !== a.createdAt.getTime())
            return b.createdAt.getTime() - a.createdAt.getTime();
          return b.id < a.id ? -1 : 1;
        });

      // Apply cursor
      let startIndex = 0;
      if (cursor) {
        const idx = scored.findIndex((u) => u.id === cursor);
        if (idx !== -1) startIndex = idx + 1;
      }

      const slice = scored.slice(startIndex, startIndex + pageSize + 1);
      const hasMore = slice.length > pageSize;
      const pageItems = hasMore ? slice.slice(0, pageSize) : slice;

      // Viewer follow state (all are not followed — excluded above)
      const items: FollowListUser[] = pageItems.map((u) => ({
        id: u.id,
        username: u.username,
        displayName: u.displayName,
        avatarUrl: u.avatarUrl,
        isFollowing: false,
      }));

      return {
        items,
        nextCursor: hasMore ? (pageItems[pageItems.length - 1]?.id ?? null) : null,
      };
    },

    async getRecommendedPosts({
      viewerId,
      cursor,
      limit,
    }: GetRecommendedPostsParams): Promise<FeedPage> {
      const pageSize = Math.min(limit ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const followedIds = viewerId
        ? (
            await prisma.follow.findMany({
              where: { followerId: viewerId },
              select: { followingId: true },
            })
          ).map((f) => f.followingId)
        : [];

      // Candidate 1: posts liked or reposted by users the viewer follows
      const engagedPostIds: string[] = [];
      if (followedIds.length > 0) {
        const [likedRows, repostedRows] = await Promise.all([
          prisma.like.findMany({
            where: { userId: { in: followedIds } },
            select: { postId: true },
            take: 200,
          }),
          prisma.repost.findMany({
            where: { userId: { in: followedIds } },
            select: { postId: true },
            take: 200,
          }),
        ]);
        likedRows.forEach((r) => engagedPostIds.push(r.postId));
        repostedRows.forEach((r) => engagedPostIds.push(r.postId));
      }

      // Candidate 2: posts by authors followed by people the viewer follows
      const secondHopAuthorIds =
        followedIds.length > 0
          ? (
              await prisma.follow.findMany({
                where: { followerId: { in: followedIds } },
                select: { followingId: true },
                distinct: ['followingId'],
                take: 100,
              })
            ).map((f) => f.followingId)
          : [];

      const secondHopPostIds =
        secondHopAuthorIds.length > 0
          ? (
              await prisma.post.findMany({
                where: {
                  parentId: null,
                  authorId: { in: secondHopAuthorIds },
                  createdAt: { gte: sevenDaysAgo },
                },
                select: { id: true },
                take: 200,
              })
            ).map((p) => p.id)
          : [];

      // Candidate 3: recently engaged public posts as fallback
      const recentEngagedPostIds = (
        await prisma.post.findMany({
          where: { parentId: null, createdAt: { gte: sevenDaysAgo } },
          orderBy: [{ likes: { _count: 'desc' } }, { createdAt: 'desc' }],
          select: { id: true },
          take: 100,
        })
      ).map((p) => p.id);

      const allCandidateIds = [
        ...new Set([...engagedPostIds, ...secondHopPostIds, ...recentEngagedPostIds]),
      ];

      if (allCandidateIds.length === 0) {
        return { items: [], nextCursor: null };
      }

      // Fetch all candidate posts
      const posts = await prisma.post.findMany({
        where: {
          id: { in: allCandidateIds },
          parentId: null,
          ...(viewerId ? { authorId: { not: viewerId } } : {}),
          // Exclude posts from directly followed authors when practical
          ...(followedIds.length > 0 ? { authorId: { notIn: followedIds } } : {}),
        },
        include: {
          author: {
            select: { id: true, username: true, displayName: true, avatarUrl: true },
          },
          _count: { select: { replies: true, likes: true, reposts: true } },
          likes: viewerId
            ? { where: { userId: viewerId }, select: { userId: true }, take: 1 }
            : false,
          reposts: viewerId
            ? { where: { userId: viewerId }, select: { userId: true }, take: 1 }
            : false,
          bookmarks: viewerId
            ? { where: { userId: viewerId }, select: { userId: true }, take: 1 }
            : false,
          images: { select: { id: true, url: true, order: true }, orderBy: { order: 'asc' } },
        },
      });

      // Count followed-user engagement per post
      const followedEngagementMap = new Map<string, number>();
      if (followedIds.length > 0) {
        const [likedEngaged, repostedEngaged] = await Promise.all([
          prisma.like.findMany({
            where: { userId: { in: followedIds }, postId: { in: posts.map((p) => p.id) } },
            select: { postId: true },
          }),
          prisma.repost.findMany({
            where: { userId: { in: followedIds }, postId: { in: posts.map((p) => p.id) } },
            select: { postId: true },
          }),
        ]);
        likedEngaged.forEach((r) => {
          followedEngagementMap.set(r.postId, (followedEngagementMap.get(r.postId) ?? 0) + 1);
        });
        repostedEngaged.forEach((r) => {
          followedEngagementMap.set(r.postId, (followedEngagementMap.get(r.postId) ?? 0) + 1);
        });
      }

      // Count how many second-hop authors authored each post
      const secondHopAuthorSet = new Set(secondHopAuthorIds);

      // Score and sort
      const scored = posts
        .map((p) => {
          const postAgeDays = Math.floor(
            (now.getTime() - p.createdAt.getTime()) / (1000 * 60 * 60 * 24),
          );
          const score = scoreRecommendedPost(
            followedEngagementMap.get(p.id) ?? 0,
            secondHopAuthorSet.has(p.authorId) ? 1 : 0,
            p._count.likes,
            p._count.reposts,
            p._count.replies,
            postAgeDays,
          );
          return { ...p, score };
        })
        .sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          if (b.createdAt.getTime() !== a.createdAt.getTime())
            return b.createdAt.getTime() - a.createdAt.getTime();
          return b.id < a.id ? -1 : 1;
        });

      // Apply cursor
      let startIndex = 0;
      if (cursor) {
        const idx = scored.findIndex((p) => p.id === cursor);
        if (idx !== -1) startIndex = idx + 1;
      }

      const slice = scored.slice(startIndex, startIndex + pageSize + 1);
      const hasMore = slice.length > pageSize;
      const pageItems = hasMore ? slice.slice(0, pageSize) : slice;

      const items: FeedPost[] = pageItems.map((p) => ({
        id: p.id,
        body: p.body,
        createdAt: p.createdAt.toISOString(),
        author: p.author,
        replyCount: p._count.replies,
        likeCount: p._count.likes,
        isLikedByViewer: Array.isArray(p.likes) ? p.likes.length > 0 : false,
        repostCount: p._count.reposts,
        isRepostedByViewer: Array.isArray(p.reposts) ? p.reposts.length > 0 : false,
        isBookmarkedByViewer: Array.isArray(p.bookmarks) ? p.bookmarks.length > 0 : false,
        images: p.images,
      }));

      return {
        items,
        nextCursor: hasMore ? (pageItems[pageItems.length - 1]?.id ?? null) : null,
      };
    },
  };
}
