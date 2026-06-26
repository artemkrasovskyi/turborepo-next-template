import { requireViewerUser } from '@/features/auth/lib/viewer';
import { FeedList } from '@/features/feed/components/feed-list';
import { PostComposer } from '@/features/post-composer/components/post-composer';

export const dynamic = 'force-dynamic';

const Page = async () => {
  const viewer = await requireViewerUser();

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-6 py-12 md:max-w-3xl">
      <PostComposer />
      <FeedList viewerId={viewer.id} />
    </main>
  );
};

export default Page;
