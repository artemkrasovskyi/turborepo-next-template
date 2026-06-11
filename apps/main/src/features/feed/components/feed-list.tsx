import { createFeedClient } from '@repo/api-client/features/feed';
import { FeedItem } from './feed-item';
import { LoadMoreButton } from './load-more-button';

const feedClient = createFeedClient();

type FeedListProps = {
  viewerId: string;
};

export async function FeedList({ viewerId }: FeedListProps) {
  const { items, nextCursor } = await feedClient.getHomeFeed({ viewerId });

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
        <h2 className="text-lg font-semibold text-slate-950">Your feed is empty</h2>
        <p className="mt-2 text-sm text-slate-600">Follow other people to see their posts here.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {items.map((post) => (
        <FeedItem key={post.id} post={post} />
      ))}
      <LoadMoreButton viewerId={viewerId} initialCursor={nextCursor} />
    </div>
  );
}
