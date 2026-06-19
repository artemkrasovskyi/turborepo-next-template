import type { ThreadPost } from '@repo/types/features/posts';
import { BookmarkButton } from '@/features/bookmarks/components/bookmark-button';
import { LikeButton } from '@/features/likes/components/like-button';
import { PostImageGrid } from '@/features/ui/components/post-image-grid';
import { formatRelativeTime } from '../lib/format-relative-time';

type PostCardProps = {
  post: ThreadPost;
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

export function PostCard({ post, viewerId }: PostCardProps) {
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
      {post.images.length > 0 ? <PostImageGrid images={post.images} /> : null}
      <div className="mt-3 flex items-center gap-4">
        <LikeButton
          viewerId={viewerId}
          postId={post.id}
          initialIsLiked={post.isLikedByViewer}
          initialLikeCount={post.likeCount}
        />
        <BookmarkButton
          viewerId={viewerId}
          postId={post.id}
          initialIsBookmarked={post.isBookmarkedByViewer}
        />
      </div>
    </article>
  );
}
