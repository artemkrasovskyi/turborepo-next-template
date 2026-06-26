import Link from 'next/link';
import { createFollowClient } from '@repo/api-client/features/follow';
import { createProfileClient } from '@repo/api-client/features/profile';
import { getViewerUser } from '@/features/auth/lib/viewer';
import { FollowingList } from '@/features/follow/components/following-list';
import { EmptyState } from '@/features/ui/components/empty-state';

export const dynamic = 'force-dynamic';

const followClient = createFollowClient();
const profileClient = createProfileClient();

type PageProps = {
  params: Promise<{ username: string }>;
};

const FollowingPage = async ({ params }: PageProps) => {
  const { username } = await params;
  const viewer = await getViewerUser();
  const profile = await profileClient.getProfileByUsername(username, viewer?.id);

  if (!profile) {
    return (
      <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-6 py-12 md:max-w-3xl">
        <EmptyState
          heading="Profile not found"
          description={`There's no user with the username @${username}.`}
        />
      </main>
    );
  }

  const initialPage = await followClient.getFollowing({ userId: profile.id, viewerId: viewer?.id });

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-6 py-12 md:max-w-3xl">
      <header>
        <Link
          href={`/profile/${username}`}
          className="focus-ring rounded text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
        >
          ← @{username}
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-[var(--color-text)]">Following</h1>
        <p className="text-sm text-[var(--color-text-muted)]">{profile.followingCount} following</p>
      </header>
      {initialPage.items.length === 0 ? (
        <EmptyState
          heading="Not following anyone"
          description={`@${username} isn't following anyone yet.`}
        />
      ) : (
        <FollowingList
          initialPage={initialPage}
          userId={profile.id}
          viewerId={viewer?.id ?? null}
        />
      )}
    </main>
  );
};

export default FollowingPage;
