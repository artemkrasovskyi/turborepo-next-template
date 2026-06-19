import type { FollowListPage } from '@repo/types/features/follow';
import { FollowUserCard } from '@/features/follow/components/follow-user-card';
import { EmptyState } from '@/features/ui/components/empty-state';
import { SuggestedUsersLoadMoreButton } from './suggested-users-load-more-button';

type SuggestedUsersProps = {
  page: FollowListPage;
  viewerId: string | null;
};

export function SuggestedUsers({ page, viewerId }: SuggestedUsersProps) {
  if (page.items.length === 0) {
    return (
      <EmptyState
        heading="No suggestions yet"
        description="Follow more people to get personalized suggestions."
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        {page.items.map((user) => (
          <FollowUserCard key={user.id} user={user} viewerId={viewerId} />
        ))}
      </div>
      {page.nextCursor !== null ? (
        <SuggestedUsersLoadMoreButton
          initialCursor={page.nextCursor}
          viewerId={viewerId}
        />
      ) : null}
    </div>
  );
}
