import { requireViewerUser } from '@/features/auth/lib/viewer';
import { FeedList } from '@/features/feed/components/feed-list';
import { PostComposer } from '@/features/post-composer/components/post-composer';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const viewer = await requireViewerUser();

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-6 py-12 md:max-w-3xl">
      <header>
        <h1 className="text-2xl font-semibold text-slate-950">Home</h1>
        <p className="mt-1 text-sm text-slate-600">
          Posts from people you follow, and your own posts.
        </p>
      </header>
      <PostComposer />
      <FeedList viewerId={viewer.id} />
    </main>
  );
}
