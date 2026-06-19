import { requireViewerUser } from '@/features/auth/lib/viewer';
import { BookmarkedPosts } from '@/features/bookmarks/components/bookmarked-posts';

export const dynamic = 'force-dynamic';

export default async function BookmarksPage() {
  const viewer = await requireViewerUser();

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-6 py-12 md:max-w-3xl">
      <header>
        <h1 className="text-2xl font-semibold text-slate-950">Bookmarks</h1>
        <p className="mt-1 text-sm text-slate-600">Posts you saved for later.</p>
      </header>
      <BookmarkedPosts viewerId={viewer.id} />
    </main>
  );
}
