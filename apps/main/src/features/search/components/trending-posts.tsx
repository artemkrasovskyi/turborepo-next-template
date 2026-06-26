import { FC } from 'react';
import type { FeedPost } from '@repo/types/features/feed';
import { FeedItem } from '@/features/feed/components/feed-item';
import { EmptyState } from '@/features/ui/components/empty-state';

type TrendingPostsProps = {
  posts: FeedPost[];
  viewerId: string | null;
};

export const TrendingPosts: FC<TrendingPostsProps> = ({ posts, viewerId }) => {
  if (posts.length === 0) {
    return (
      <EmptyState
        heading="Nothing trending yet"
        description="Posts with the most likes this week will appear here."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {posts.map((post) => (
        <FeedItem key={post.id} post={post} viewerId={viewerId} />
      ))}
    </div>
  );
}
