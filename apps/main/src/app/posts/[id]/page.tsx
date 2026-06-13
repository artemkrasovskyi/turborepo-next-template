import { createPostsClient } from '@repo/api-client/features/posts';
import { createUsersClient } from '@repo/api-client/features/users';
import { PostCard } from '@/features/post-thread/components/post-card';
import { ReplyComposer } from '@/features/post-thread/components/reply-composer';

export const dynamic = 'force-dynamic';

const postsClient = createPostsClient();
const usersClient = createUsersClient();

type ThreadPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ThreadPage({ params }: ThreadPageProps) {
  const { id } = await params;

  const viewer = await usersClient.getViewerUser();
  const thread = await postsClient.getThread({ postId: id, viewerId: viewer?.id });

  if (!thread) {
    return (
      <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-6 py-12">
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
          <h1 className="text-lg font-semibold text-slate-950">Post not found</h1>
          <p className="mt-2 text-sm text-slate-600">
            This post doesn&apos;t exist or was removed.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-4 px-6 py-12">
      <PostCard post={thread.root} viewerId={viewer?.id ?? null} />
      {viewer ? <ReplyComposer authorId={viewer.id} parentId={thread.root.id} /> : null}
      {thread.replies.length === 0 ? (
        <p className="text-sm text-slate-600">No replies yet.</p>
      ) : (
        thread.replies.map((reply) => (
          <PostCard key={reply.id} post={reply} viewerId={viewer?.id ?? null} />
        ))
      )}
    </main>
  );
}
