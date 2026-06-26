import { FC } from 'react';
import Link from 'next/link';
import type { FollowListUser } from '@repo/types/features/follow';
import { FollowButton } from './follow-button';

type FollowUserCardProps = {
  user: FollowListUser;
  viewerId: string | null;
};

const getInitials = (displayName: string): string =>
  displayName
    .split(' ')
    .filter((part) => part.length > 0)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

export const FollowUserCard: FC<FollowUserCardProps> = ({ user, viewerId }) => (
    <div className="flex items-center gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] text-sm font-semibold text-[var(--color-accent-foreground)]">
        {getInitials(user.displayName)}
      </div>
      <div className="min-w-0 flex-1">
        <Link
          href={`/profile/${user.username}`}
          className="focus-ring rounded font-semibold text-[var(--color-text)] hover:underline"
        >
          {user.displayName}
        </Link>
        <p className="text-sm text-[var(--color-text-muted)]">@{user.username}</p>
      </div>
      {viewerId !== null && viewerId !== user.id ? (
        <FollowButton
          viewerId={viewerId}
          targetUserId={user.id}
          initialIsFollowing={user.isFollowing}
        />
      ) : null}
    </div>
);
