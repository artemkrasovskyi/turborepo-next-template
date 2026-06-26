import { createFeedClient } from '@repo/api-client/features/feed';
import { EmptyState } from '@/features/ui/components/empty-state';
import { FeedItem } from './feed-item';
import { LoadMoreButton } from './load-more-button';

const feedClient = createFeedClient();

type FeedListProps = {
  viewerId: string;
};

export const FeedList = async ({ viewerId }: FeedListProps) => {
  const { items, nextCursor } = await feedClient.getHomeFeed({ viewerId });

  if (items.length === 0) {
    return (
      <EmptyState
        heading="Your feed is empty"
        description="Follow other people to see their posts here."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {items.map((post) => (
        <FeedItem key={post.id} post={post} viewerId={viewerId} />
      ))}
      <LoadMoreButton viewerId={viewerId} initialCursor={nextCursor} />
    </div>
  );
}
