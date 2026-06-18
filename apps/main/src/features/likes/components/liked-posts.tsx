import { createLikesClient } from '@repo/api-client/features/likes';
import { FeedItem } from '@/features/feed/components/feed-item';
import { EmptyState } from '@/features/ui/components/empty-state';
import { LikedPostsLoadMoreButton } from './liked-posts-load-more-button';

const likesClient = createLikesClient();

type LikedPostsProps = {
  userId: string;
  viewerId: string | null;
};

export async function LikedPosts({ userId, viewerId }: LikedPostsProps) {
  const { items, nextCursor } = await likesClient.getLikedPosts({
    userId,
    ...(viewerId ? { viewerId } : {}),
  });

  if (items.length === 0) {
    return (
      <EmptyState heading="No liked posts yet" description="This user hasn't liked any posts yet." />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {items.map((post) => (
        <FeedItem key={post.id} post={post} viewerId={viewerId} />
      ))}
      <LikedPostsLoadMoreButton userId={userId} viewerId={viewerId} initialCursor={nextCursor} />
    </div>
  );
}
