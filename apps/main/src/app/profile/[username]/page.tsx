import { createProfileClient } from '@repo/api-client/features/profile';
import { getViewerUser } from '@/features/auth/lib/viewer';
import { ProfileHeader } from '@/features/profile/components/profile-header';
import { ProfilePosts } from '@/features/profile/components/profile-posts';
import { EmptyState } from '@/features/ui/components/empty-state';

export const dynamic = 'force-dynamic';

const profileClient = createProfileClient();

type ProfilePageProps = {
  params: Promise<{ username: string }>;
};

export default async function ProfilePage({ params }: ProfilePageProps) {
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

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-6 py-12 md:max-w-3xl">
      <ProfileHeader
        profile={profile}
        viewerId={viewer?.id ?? null}
        isOwnProfile={viewer?.id === profile.id}
      />
      <ProfilePosts userId={profile.id} viewerId={viewer?.id ?? null} />
    </main>
  );
}
