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
    <article className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] text-sm font-semibold text-[var(--color-accent-foreground)]">
          {getInitials(post.author.displayName)}
        </div>
        <div>
          <p className="font-semibold text-[var(--color-text)]">{post.author.displayName}</p>
          <p className="text-sm text-[var(--color-text-muted)]">
            @{post.author.username} · {formatRelativeTime(post.createdAt)}
          </p>
        </div>
      </div>
      <p className="mt-3 whitespace-pre-wrap text-base leading-7 text-[var(--color-text)]">
        {post.body}
      </p>
      {post.images.length > 0 ? <PostImageGrid images={post.images} /> : null}
      <div className="mt-4 flex items-center gap-5">
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
