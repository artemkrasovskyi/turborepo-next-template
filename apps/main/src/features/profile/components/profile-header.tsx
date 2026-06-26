import { FC, ReactNode } from 'react';
import Link from 'next/link';
import type { ProfileUser } from '@repo/types/features/profile';
import { MessageButton } from '@/features/direct-messages/components/message-button';
import { FollowButton } from '@/features/follow/components/follow-button';
import { EditProfileButton } from './edit-profile-button';
import { ProfileTabs } from './profile-tabs';

type ProfileHeaderProps = {
  profile: ProfileUser;
  viewerId: string | null;
  isOwnProfile: boolean;
};

const getInitials = (displayName: string): string =>
  displayName
    .split(' ')
    .filter((part) => part.length > 0)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

const joinDateFormatter = new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' });

export const ProfileHeader: FC<ProfileHeaderProps> = ({ profile, viewerId, isOwnProfile }) => {
  let headerAction: ReactNode = null;
  if (isOwnProfile) {
    headerAction = (
      <EditProfileButton
        username={profile.username}
        displayName={profile.displayName}
        bio={profile.bio}
        avatarUrl={profile.avatarUrl}
      />
    );
  } else if (viewerId) {
    headerAction = (
      <div className="flex items-center gap-2">
        <MessageButton otherUserId={profile.id} />
        <FollowButton
          viewerId={viewerId}
          targetUserId={profile.id}
          initialIsFollowing={profile.isFollowing}
        />
      </div>
    );
  }

  return (
    <header className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--color-accent)] text-xl font-semibold text-[var(--color-accent-foreground)]">
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={profile.displayName}
              className="h-full w-full object-cover"
            />
          ) : (
            getInitials(profile.displayName)
          )}
        </div>
        <div className="flex-1">
          <p className="text-lg font-semibold text-[var(--color-text)]">{profile.displayName}</p>
          <p className="text-sm text-[var(--color-text-muted)]">@{profile.username}</p>
        </div>
        {headerAction}
      </div>
      {profile.bio ? (
        <p className="mt-4 text-base leading-7 text-[var(--color-text)]">{profile.bio}</p>
      ) : null}
      <p className="mt-3 text-sm text-[var(--color-text-muted)]">
        Joined {joinDateFormatter.format(new Date(profile.createdAt))}
      </p>
      <div className="mt-3 flex gap-4 text-sm text-[var(--color-text-muted)]">
        <Link
          href={`/profile/${profile.username}/following`}
          className="focus-ring rounded hover:underline"
        >
          <span className="font-semibold text-[var(--color-text)]">{profile.followingCount}</span>{' '}
          Following
        </Link>
        <Link
          href={`/profile/${profile.username}/followers`}
          className="focus-ring rounded hover:underline"
        >
          <span className="font-semibold text-[var(--color-text)]">{profile.followerCount}</span>{' '}
          Followers
        </Link>
      </div>
      <div className="mt-4">
        <ProfileTabs username={profile.username} />
      </div>
    </header>
  );
}
