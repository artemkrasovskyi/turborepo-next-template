import { prisma } from '@repo/shared/features/database';
import type { FeedAuthor, FeedPage, FeedPost } from '@repo/types/features/feed';

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 20;

const authorSelect = {
  id: true,
  username: true,
  displayName: true,
  avatarUrl: true,
} as const;

type GetHomeFeedParams = {
  viewerId: string;
  cursor?: string;
  limit?: number;
};

type FeedEntry = {
  feedTime: Date;
  postId: string;
  item: FeedPost;
};

function mapPostToEntry(
  post: {
    id: string;
    body: string;
    createdAt: Date;
    author: FeedAuthor;
    _count: { replies: number; likes: number; reposts: number };
    likes: { userId: string }[];
    reposts: { userId: string }[];
    bookmarks: { userId: string }[];
    images: { id: string; url: string; order: number }[];
  },
  repostedBy?: FeedAuthor,
  feedTime?: Date,
): FeedEntry {
  return {
    feedTime: feedTime ?? post.createdAt,
    postId: post.id,
    item: {
      id: post.id,
      body: post.body,
      createdAt: (feedTime ?? post.createdAt).toISOString(),
      author: post.author,
      replyCount: post._count.replies,
      likeCount: post._count.likes,
      repostCount: post._count.reposts,
      isLikedByViewer: post.likes.length > 0,
      isRepostedByViewer: post.reposts.length > 0,
      isBookmarkedByViewer: post.bookmarks.length > 0,
      images: post.images,
      ...(repostedBy ? { repostedBy } : {}),
    },
  };
}

export function createFeedClient() {
  return {
    async getHomeFeed({ viewerId, cursor, limit }: GetHomeFeedParams): Promise<FeedPage> {
      const pageSize = Math.min(limit ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
      const cursorDate = cursor ? new Date(cursor) : null;

      const follows = await prisma.follow.findMany({
        where: { followerId: viewerId },
        select: { followingId: true },
      });

      const followedIds = [...follows.map((f) => f.followingId), viewerId];

      const postInclude = {
        author: { select: authorSelect },
        _count: { select: { replies: true, likes: true, reposts: true } },
        likes: { where: { userId: viewerId }, select: { userId: true }, take: 1 },
        reposts: { where: { userId: viewerId }, select: { userId: true }, take: 1 },
        bookmarks: { where: { userId: viewerId }, select: { userId: true }, take: 1 },
        images: { select: { id: true, url: true, order: true }, orderBy: { order: 'asc' as const } },
      } as const;

      const [posts, reposts] = await Promise.all([
        prisma.post.findMany({
          where: {
            parentId: null,
            authorId: { in: followedIds },
            ...(cursorDate ? { createdAt: { lt: cursorDate } } : {}),
          },
          orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
          take: pageSize + 1,
          include: postInclude,
        }),
        prisma.repost.findMany({
          where: {
            userId: { in: followedIds },
            ...(cursorDate ? { createdAt: { lt: cursorDate } } : {}),
          },
          orderBy: [{ createdAt: 'desc' }],
          take: pageSize + 1,
          include: {
            user: { select: authorSelect },
            post: { include: postInclude },
          },
        }),
      ]);

      const postEntries: FeedEntry[] = posts.map((p) => mapPostToEntry(p));
      const repostEntries: FeedEntry[] = reposts.map((r) =>
        mapPostToEntry(r.post, r.user, r.createdAt),
      );

      const merged = [...postEntries, ...repostEntries].sort((a, b) => {
        const diff = b.feedTime.getTime() - a.feedTime.getTime();
        if (diff !== 0) return diff;
        return b.postId > a.postId ? 1 : -1;
      });

      // Deduplicate by postId — keep first occurrence (latest feedTime due to sort order)
      const seen = new Set<string>();
      const deduped = merged.filter((entry) => {
        if (seen.has(entry.postId)) return false;
        seen.add(entry.postId);
        return true;
      });

      const hasMore = deduped.length > pageSize;
      const pageItems = hasMore ? deduped.slice(0, pageSize) : deduped;

      return {
        items: pageItems.map((e) => e.item),
        nextCursor: hasMore ? (pageItems[pageItems.length - 1]?.feedTime.toISOString() ?? null) : null,
      };
    },
  };
}
