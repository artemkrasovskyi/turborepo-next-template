import Link from 'next/link';
import type { NotificationItem as NotificationItemData } from '@repo/types/features/notifications';
import { formatRelativeTime } from '../lib/format-relative-time';

type NotificationItemProps = {
  notification: NotificationItemData;
};

const POST_SNIPPET_LENGTH = 80;

function getInitials(displayName: string): string {
  return displayName
    .split(' ')
    .filter((part) => part.length > 0)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

function truncate(body: string, length: number): string {
  return body.length > length ? `${body.slice(0, length).trimEnd()}…` : body;
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const { actor, type, createdAt, post } = notification;
  const href = type === 'LIKE' && post ? `/posts/${post.id}` : `/profile/${actor.username}`;

  return (
    <Link
      href={href}
      className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-5 shadow-sm hover:bg-slate-50"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-600 text-sm font-semibold text-white">
        {getInitials(actor.displayName)}
      </div>
      <div>
        <p className="text-base text-slate-800">
          <span className="font-semibold text-slate-950">{actor.displayName}</span>{' '}
          <span className="text-slate-500">@{actor.username}</span>{' '}
          {type === 'FOLLOW' ? 'started following you' : 'liked your post'}
        </p>
        {type === 'LIKE' && post ? (
          <p className="mt-1 text-sm text-slate-500">“{truncate(post.body, POST_SNIPPET_LENGTH)}”</p>
        ) : null}
        <p className="mt-1 text-sm text-slate-500">{formatRelativeTime(createdAt)}</p>
      </div>
    </Link>
  );
}
