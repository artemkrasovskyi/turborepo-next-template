import { createProfileClient } from '@repo/api-client/features/profile';
import { FeedItem } from '@/features/feed/components/feed-item';
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
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
        <h2 className="text-lg font-semibold text-slate-950">No posts yet</h2>
        <p className="mt-2 text-sm text-slate-600">This user hasn&apos;t posted anything yet.</p>
      </div>
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
