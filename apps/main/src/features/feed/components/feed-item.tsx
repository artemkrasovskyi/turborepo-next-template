import Link from 'next/link';
import type { FeedPost } from '@repo/types/features/feed';
import { LikeButton } from '@/features/likes/components/like-button';
import { formatRelativeTime } from '../lib/format-relative-time';

type FeedItemProps = {
  post: FeedPost;
  viewerId: string | null;
};

function getInitials(displayName: string): string {
  return displayName
    .split(' ')
    .filter((part) => part.length > 0)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

export function FeedItem({ post, viewerId }: FeedItemProps) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <Link
        href={`/profile/${post.author.username}`}
        className="focus-ring flex items-center gap-3 rounded-lg"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-600 text-sm font-semibold text-white">
          {getInitials(post.author.displayName)}
        </div>
        <div>
          <p className="font-semibold text-slate-950 hover:underline">{post.author.displayName}</p>
          <p className="text-sm text-slate-500">
            @{post.author.username} · {formatRelativeTime(post.createdAt)}
          </p>
        </div>
      </Link>
      <Link href={`/posts/${post.id}`} className="focus-ring mt-3 block rounded-lg">
        <p className="whitespace-pre-wrap text-base leading-7 text-slate-800">{post.body}</p>
      </Link>
      <div className="mt-3 flex items-center gap-4">
        <Link
          href={`/posts/${post.id}`}
          className="focus-ring rounded text-sm text-slate-500 hover:underline"
        >
          {post.replyCount} {post.replyCount === 1 ? 'reply' : 'replies'}
        </Link>
        <LikeButton
          viewerId={viewerId}
          postId={post.id}
          initialIsLiked={post.isLikedByViewer}
          initialLikeCount={post.likeCount}
        />
      </div>
    </article>
  );
}
