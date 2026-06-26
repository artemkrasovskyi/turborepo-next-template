import { FC } from 'react';
import type { FollowListUser } from '@repo/types/features/follow';
import { FollowUserCard } from '@/features/follow/components/follow-user-card';
import { EmptyState } from '@/features/ui/components/empty-state';

type RecentUsersProps = {
  users: FollowListUser[];
  viewerId: string | null;
};

export const RecentUsers: FC<RecentUsersProps> = ({ users, viewerId }) => {
  if (users.length === 0) {
    return <EmptyState heading="No users yet" description="Be the first to join." />;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {users.map((user) => (
        <FollowUserCard key={user.id} user={user} viewerId={viewerId} />
      ))}
    </div>
  );
}
