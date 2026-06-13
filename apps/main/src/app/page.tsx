import Link from 'next/link';
import { createUsersClient } from '@repo/api-client/features/users';
import { FeedList } from '@/features/feed/components/feed-list';
import { PostComposer } from '@/features/post-composer/components/post-composer';

export const dynamic = 'force-dynamic';

const usersClient = createUsersClient();

export default async function Page() {
  const viewer = await usersClient.getViewerUser();

  if (!viewer) {
    return (
      <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-6 py-12">
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
          <h1 className="text-lg font-semibold text-slate-950">No users yet</h1>
          <p className="mt-2 text-sm text-slate-600">
            Run{' '}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs">
              bun run db:seed
            </code>{' '}
            to add sample data.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-6 py-12">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">Home</h1>
          <p className="mt-1 text-sm text-slate-600">
            Posts from people you follow, and your own posts.
          </p>
        </div>
        <Link href="/notifications" className="text-sm font-semibold text-teal-700 hover:underline">
          Notifications
        </Link>
      </header>
      <PostComposer authorId={viewer.id} />
      <FeedList viewerId={viewer.id} />
    </main>
  );
}
