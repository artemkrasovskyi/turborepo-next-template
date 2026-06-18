import Link from 'next/link';
import type { ProfileUser } from '@repo/types/features/profile';
import { FollowButton } from '@/features/follow/components/follow-button';
import { ProfileTabs } from './profile-tabs';

type ProfileHeaderProps = {
  profile: ProfileUser;
  viewerId: string | null;
};

function getInitials(displayName: string): string {
  return displayName
    .split(' ')
    .filter((part) => part.length > 0)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

const joinDateFormatter = new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' });

export function ProfileHeader({ profile, viewerId }: ProfileHeaderProps) {
  return (
    <header className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-teal-600 text-xl font-semibold text-white">
          {getInitials(profile.displayName)}
        </div>
        <div className="flex-1">
          <p className="text-lg font-semibold text-slate-950">{profile.displayName}</p>
          <p className="text-sm text-slate-500">@{profile.username}</p>
        </div>
        {viewerId ? (
          <FollowButton
            viewerId={viewerId}
            targetUserId={profile.id}
            initialIsFollowing={profile.isFollowing}
          />
        ) : null}
      </div>
      {profile.bio ? (
        <p className="mt-4 text-base leading-7 text-slate-800">{profile.bio}</p>
      ) : null}
      <p className="mt-3 text-sm text-slate-500">
        Joined {joinDateFormatter.format(new Date(profile.createdAt))}
      </p>
      <div className="mt-3 flex gap-4 text-sm text-slate-700">
        <Link
          href={`/profile/${profile.username}/following`}
          className="focus-ring rounded hover:underline"
        >
          <span className="font-semibold text-slate-950">{profile.followingCount}</span> Following
        </Link>
        <Link
          href={`/profile/${profile.username}/followers`}
          className="focus-ring rounded hover:underline"
        >
          <span className="font-semibold text-slate-950">{profile.followerCount}</span> Followers
        </Link>
      </div>
      <div className="mt-4">
        <ProfileTabs username={profile.username} />
      </div>
    </header>
  );
}
