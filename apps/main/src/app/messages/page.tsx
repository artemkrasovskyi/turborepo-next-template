import { createUsersClient } from '@repo/api-client/features/users';
import { InboxList } from '@/features/direct-messages/components/inbox-list';
import { EmptyState } from '@/features/ui/components/empty-state';

export const dynamic = 'force-dynamic';

const usersClient = createUsersClient();

export default async function MessagesPage() {
  const viewer = await usersClient.getViewerUser();

  if (!viewer) {
    return (
      <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-6 py-12 md:max-w-3xl">
        <EmptyState
          heading="Messages are private"
          description="Sign in as a sample user to view conversations."
        />
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-6 py-12 md:max-w-3xl">
      <header>
        <h1 className="text-2xl font-semibold text-slate-950">Messages</h1>
        <p className="mt-1 text-sm text-slate-600">Private conversations with other users.</p>
      </header>
      <InboxList viewerId={viewer.id} />
    </main>
  );
}
