import type { FeedPost } from '@repo/types/features/feed';
import { formatRelativeTime } from '../lib/format-relative-time';

type FeedItemProps = {
  post: FeedPost;
};

function getInitials(displayName: string): string {
  return displayName
    .split(' ')
    .filter((part) => part.length > 0)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

export function FeedItem({ post }: FeedItemProps) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-600 text-sm font-semibold text-white">
          {getInitials(post.author.displayName)}
        </div>
        <div>
          <p className="font-semibold text-slate-950">{post.author.displayName}</p>
          <p className="text-sm text-slate-500">
            @{post.author.username} · {formatRelativeTime(post.createdAt)}
          </p>
        </div>
      </div>
      <p className="mt-3 whitespace-pre-wrap text-base leading-7 text-slate-800">{post.body}</p>
    </article>
  );
}
