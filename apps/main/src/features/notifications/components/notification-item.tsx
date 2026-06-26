import { FC } from 'react';
import Link from 'next/link';
import type { NotificationItem as NotificationItemData } from '@repo/types/features/notifications';
import { RelativeTime } from '@/features/ui/components/relative-time';

type NotificationItemProps = {
  notification: NotificationItemData;
};

const POST_SNIPPET_LENGTH = 80;

const getInitials = (displayName: string): string =>
  displayName
    .split(' ')
    .filter((part) => part.length > 0)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

const truncate = (body: string, length: number): string =>
  body.length > length ? `${body.slice(0, length).trimEnd()}…` : body;

export const NotificationItem: FC<NotificationItemProps> = ({ notification }) => {
  const { actor, type, createdAt, post } = notification;
  const href = type === 'LIKE' && post ? `/posts/${post.id}` : `/profile/${actor.username}`;

  return (
    <Link
      href={href}
      className="focus-ring flex items-start gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm hover:bg-[var(--color-surface-elevated)]"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] text-sm font-semibold text-[var(--color-accent-foreground)]">
        {getInitials(actor.displayName)}
      </div>
      <div>
        <p className="text-base text-[var(--color-text)]">
          <span className="font-semibold">{actor.displayName}</span>{' '}
          <span className="text-[var(--color-text-muted)]">@{actor.username}</span>{' '}
          {type === 'FOLLOW' ? 'started following you' : 'liked your post'}
        </p>
        {type === 'LIKE' && post ? (
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            &ldquo;{truncate(post.body, POST_SNIPPET_LENGTH)}&rdquo;
          </p>
        ) : null}
        <p className="mt-1 text-sm text-[var(--color-text-muted)]"><RelativeTime isoDate={createdAt} /></p>
      </div>
    </Link>
  );
}
