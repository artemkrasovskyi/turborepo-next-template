import { createProfileClient } from '@repo/api-client/features/profile';
import { FeedItem } from '@/features/feed/components/feed-item';
import { EmptyState } from '@/features/ui/components/empty-state';
import { ProfileLoadMoreButton } from './profile-load-more-button';

const profileClient = createProfileClient();

type ProfilePostsProps = {
  userId: string;
  viewerId: string | null;
};

export async function ProfilePosts({ userId, viewerId }: ProfilePostsProps) {
  const { items, nextCursor } = await profileClient.getProfilePosts({
    userId,
    viewerId: viewerId ?? undefined,
  });

  if (items.length === 0) {
    return (
      <EmptyState heading="No posts yet" description="This user hasn't posted anything yet." />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {items.map((post) => (
        <FeedItem key={post.id} post={post} viewerId={viewerId} />
      ))}
      <ProfileLoadMoreButton userId={userId} viewerId={viewerId} initialCursor={nextCursor} />
    </div>
  );
}
