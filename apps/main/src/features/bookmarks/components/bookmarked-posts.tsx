import { createBookmarksClient } from '@repo/api-client/features/bookmarks';
import { FeedItem } from '@/features/feed/components/feed-item';
import { EmptyState } from '@/features/ui/components/empty-state';
import { BookmarkedPostsLoadMoreButton } from './bookmarked-posts-load-more-button';

const bookmarksClient = createBookmarksClient();

type BookmarkedPostsProps = {
  viewerId: string;
};

export const BookmarkedPosts = async ({ viewerId }: BookmarkedPostsProps) => {
  const { items, nextCursor } = await bookmarksClient.getBookmarkedPosts({
    userId: viewerId,
    viewerId,
  });

  if (items.length === 0) {
    return (
      <EmptyState
        heading="No bookmarks yet"
        description="Save posts to keep them here for later."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {items.map((post) => (
        <FeedItem key={post.id} post={post} viewerId={viewerId} />
      ))}
      <BookmarkedPostsLoadMoreButton viewerId={viewerId} initialCursor={nextCursor} />
    </div>
  );
}
