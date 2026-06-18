import { createProfileClient } from '@repo/api-client/features/profile';
import { createUsersClient } from '@repo/api-client/features/users';
import { ProfileHeader } from '@/features/profile/components/profile-header';
import { LikedPosts } from '@/features/likes/components/liked-posts';
import { EmptyState } from '@/features/ui/components/empty-state';

export const dynamic = 'force-dynamic';

const profileClient = createProfileClient();
const usersClient = createUsersClient();

type LikesPageProps = {
  params: Promise<{ username: string }>;
};

export default async function LikesPage({ params }: LikesPageProps) {
  const { username } = await params;
  const viewer = await usersClient.getViewerUser();
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

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-6 py-12 md:max-w-3xl">
      <ProfileHeader profile={profile} viewerId={viewer?.id ?? null} />
      <LikedPosts userId={profile.id} viewerId={viewer?.id ?? null} />
    </main>
  );
}
