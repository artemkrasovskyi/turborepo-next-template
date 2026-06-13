import { createProfileClient } from '@repo/api-client/features/profile';
import { ProfileHeader } from '@/features/profile/components/profile-header';
import { ProfilePosts } from '@/features/profile/components/profile-posts';

export const dynamic = 'force-dynamic';

const profileClient = createProfileClient();

type ProfilePageProps = {
  params: Promise<{ username: string }>;
};

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  const profile = await profileClient.getProfileByUsername(username);

  if (!profile) {
    return (
      <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-6 py-12">
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
          <h1 className="text-lg font-semibold text-slate-950">Profile not found</h1>
          <p className="mt-2 text-sm text-slate-600">
            There&apos;s no user with the username @{username}.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-6 py-12">
      <ProfileHeader profile={profile} />
      <ProfilePosts userId={profile.id} />
    </main>
  );
}
