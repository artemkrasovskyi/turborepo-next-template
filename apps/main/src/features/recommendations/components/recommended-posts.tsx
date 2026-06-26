import { FC } from 'react';
import type { FeedPage } from '@repo/types/features/feed';
import { FeedItem } from '@/features/feed/components/feed-item';
import { EmptyState } from '@/features/ui/components/empty-state';
import { RecommendedPostsLoadMoreButton } from './recommended-posts-load-more-button';

type RecommendedPostsProps = {
  page: FeedPage;
  viewerId: string | null;
};

export const RecommendedPosts: FC<RecommendedPostsProps> = ({ page, viewerId }) => {
  if (page.items.length === 0) {
    return (
      <EmptyState
        heading="No recommendations yet"
        description="Explore posts will appear here as more people join and post."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {page.items.map((post) => (
        <FeedItem key={post.id} post={post} viewerId={viewerId} />
      ))}
      {page.nextCursor !== null ? (
        <RecommendedPostsLoadMoreButton
          initialCursor={page.nextCursor}
          viewerId={viewerId}
        />
      ) : null}
    </div>
  );
}
