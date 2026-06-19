import type { DirectMessageItem } from '@repo/types/features/direct-messages';
import { formatRelativeTime } from '@/features/feed/lib/format-relative-time';

type MessageBubbleProps = {
  message: DirectMessageItem;
  viewerId: string;
};

export function MessageBubble({ message, viewerId }: MessageBubbleProps) {
  const isOwnMessage = message.sender.id === viewerId;

  return (
    <div className={isOwnMessage ? 'flex justify-end' : 'flex justify-start'}>
      <div
        className={
          isOwnMessage
            ? 'max-w-[80%] rounded-lg bg-teal-700 px-4 py-3 text-white'
            : 'max-w-[80%] rounded-lg bg-white px-4 py-3 text-slate-900 shadow-sm ring-1 ring-slate-200'
        }
      >
        <p className="whitespace-pre-wrap text-sm leading-6">{message.body}</p>
        <p className={isOwnMessage ? 'mt-1 text-xs text-teal-100' : 'mt-1 text-xs text-slate-500'}>
          {formatRelativeTime(message.createdAt)}
        </p>
      </div>
    </div>
  );
}
