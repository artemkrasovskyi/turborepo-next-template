import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import type { FeedPost } from '@repo/types/features/feed';
import { BookmarkButton } from '@/features/bookmarks/components/bookmark-button';
import { LikeButton } from '@/features/likes/components/like-button';
import { RepostButton } from '@/features/reposts/components/repost-button';
import { PostImageGrid } from '@/features/ui/components/post-image-grid';
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
    <article className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
      {post.repostedBy ? (
        <Link
          href={`/profile/${post.repostedBy.username}`}
          className="focus-ring mb-3 flex items-center gap-1 rounded text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
        >
          <span aria-hidden="true">↻</span>
          <span>{post.repostedBy.displayName} reposted</span>
        </Link>
      ) : null}
      <Link
        href={`/profile/${post.author.username}`}
        className="focus-ring flex items-center gap-3 rounded-lg"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] text-sm font-semibold text-[var(--color-accent-foreground)]">
          {getInitials(post.author.displayName)}
        </div>
        <div>
          <p className="font-semibold text-[var(--color-text)] hover:underline">
            {post.author.displayName}
          </p>
          <p className="text-sm text-[var(--color-text-muted)]">
            @{post.author.username} · {formatRelativeTime(post.createdAt)}
          </p>
        </div>
      </Link>
      <Link href={`/posts/${post.id}`} className="focus-ring mt-3 block rounded-lg">
        <p className="whitespace-pre-wrap text-base leading-7 text-[var(--color-text)]">
          {post.body}
        </p>
      </Link>
      {post.images.length > 0 ? <PostImageGrid images={post.images} /> : null}
      <div className="mt-4 flex items-center gap-5">
        <Link
          href={`/posts/${post.id}`}
          className="focus-ring flex items-center gap-1.5 rounded text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          aria-label={`${post.replyCount} ${post.replyCount === 1 ? 'reply' : 'replies'}`}
        >
          <MessageCircle size={16} aria-hidden="true" />
          <span aria-hidden="true">{post.replyCount}</span>
        </Link>
        <RepostButton
          viewerId={viewerId}
          postId={post.id}
          initialIsReposted={post.isRepostedByViewer}
          initialRepostCount={post.repostCount}
        />
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
