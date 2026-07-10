'use client';

/**
 * @openspec openspec/specs/frontend-realtime/spec.md
 * @change Phase-21-live-notifications
 */
import { FC, useState } from 'react';
import type { NotificationItem as NotificationItemData } from '@repo/types/features/notifications';
import { useRealtimeStream } from '@/features/realtime/hooks/use-realtime-stream';
import { EmptyState } from '@/features/ui/components/empty-state';
import { NotificationItem } from './notification-item';
import { NotificationLoadMoreButton } from './notification-load-more-button';

type NotificationLiveListProps = {
  initialItems: NotificationItemData[];
  initialCursor: string | null;
  viewerId: string;
};

export const NotificationLiveList: FC<NotificationLiveListProps> = ({
  initialItems,
  initialCursor,
  viewerId,
}) => {
  const [liveItems, setLiveItems] = useState<NotificationItemData[]>([]);

  useRealtimeStream({
    viewerId,
    onNotificationCreated: (notification) => {
      setLiveItems((current) => {
        if (current.some((item) => item.id === notification.id)) return current;
        return [notification, ...current];
      });
    },
  });

  const isEmpty = liveItems.length === 0 && initialItems.length === 0;

  return (
    <>
      {isEmpty ? (
        <EmptyState
          heading="No notifications yet"
          description="When people follow you or like your posts, you'll see it here."
        />
      ) : (
        <>
          {liveItems.map((notification) => (
            <NotificationItem key={notification.id} notification={notification} />
          ))}
          {initialItems.map((notification) => (
            <NotificationItem key={notification.id} notification={notification} />
          ))}
        </>
      )}
      <NotificationLoadMoreButton userId={viewerId} initialCursor={initialCursor} />
    </>
  );
};
