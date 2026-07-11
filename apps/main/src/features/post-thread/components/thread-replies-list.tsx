'use client';

/**
 * @openspec openspec/specs/frontend-realtime/spec.md
 * @openspec openspec/specs/thread-page/spec.md
 * @change Phase-22-live-replies
 */
import { FC, useState } from 'react';
import type { ThreadPost } from '@repo/types/features/posts';
import { useRealtimeStream } from '@/features/realtime/hooks/use-realtime-stream';
import { EmptyState } from '@/features/ui/components/empty-state';
import { PostCard } from './post-card';

type ThreadRepliesListProps = {
  threadId: string;
  initialReplies: ThreadPost[];
  viewerId: string | null;
};

export const ThreadRepliesList: FC<ThreadRepliesListProps> = ({
  threadId,
  initialReplies,
  viewerId,
}) => {
  const [liveReplies, setLiveReplies] = useState<ThreadPost[]>([]);

  useRealtimeStream({
    threadId,
    onReplyCreated: (reply) => {
      setLiveReplies((current) => {
        if (initialReplies.some((existing) => existing.id === reply.id)) return current;
        if (current.some((existing) => existing.id === reply.id)) return current;
        return [...current, reply];
      });
    },
  });

  const replies = [...initialReplies, ...liveReplies];

  if (replies.length === 0) {
    return <EmptyState heading="No replies yet" description="Be the first to reply to this post." />;
  }

  return (
    <>
      {replies.map((reply) => (
        <PostCard key={reply.id} post={reply} viewerId={viewerId} />
      ))}
    </>
  );
};
