import { createUsersClient } from '@repo/api-client/features/users';
import { FeedList } from '@/features/feed/components/feed-list';
import { PostComposer } from '@/features/post-composer/components/post-composer';
import { EmptyState } from '@/features/ui/components/empty-state';

export const dynamic = 'force-dynamic';

const usersClient = createUsersClient();

export default async function Page() {
  const viewer = await usersClient.getViewerUser();

  if (!viewer) {
    return (
      <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-6 py-12 md:max-w-3xl">
        <EmptyState
          heading="No users yet"
          description={
            <>
              Run{' '}
              <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs">
                bun run db:seed
              </code>{' '}
              to add sample data.
            </>
          }
        />
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-6 py-12 md:max-w-3xl">
      <header>
        <h1 className="text-2xl font-semibold text-slate-950">Home</h1>
        <p className="mt-1 text-sm text-slate-600">
          Posts from people you follow, and your own posts.
        </p>
      </header>
      <PostComposer authorId={viewer.id} />
      <FeedList viewerId={viewer.id} />
    </main>
  );
}
