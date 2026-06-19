import { createPostsClient } from '@repo/api-client/features/posts';
import { getViewerUser } from '@/features/auth/lib/viewer';
import { PostCard } from '@/features/post-thread/components/post-card';
import { ReplyComposer } from '@/features/post-thread/components/reply-composer';
import { EmptyState } from '@/features/ui/components/empty-state';

export const dynamic = 'force-dynamic';

const postsClient = createPostsClient();

type ThreadPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ThreadPage({ params }: ThreadPageProps) {
  const { id } = await params;

  const viewer = await getViewerUser();
  const thread = await postsClient.getThread({ postId: id, viewerId: viewer?.id });

  if (!thread) {
    return (
      <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-6 py-12 md:max-w-3xl">
        <EmptyState
          heading="Post not found"
          description="This post doesn't exist or was removed."
        />
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-4 px-6 py-12 md:max-w-3xl">
      <PostCard post={thread.root} viewerId={viewer?.id ?? null} />
      {viewer ? <ReplyComposer parentId={thread.root.id} /> : null}
      {thread.replies.length === 0 ? (
        <EmptyState heading="No replies yet" description="Be the first to reply to this post." />
      ) : (
        thread.replies.map((reply) => (
          <PostCard key={reply.id} post={reply} viewerId={viewer?.id ?? null} />
        ))
      )}
    </main>
  );
}
