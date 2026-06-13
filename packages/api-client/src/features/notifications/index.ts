import { prisma } from '@repo/shared/features/database';
import type { NotificationPage } from '@repo/types/features/notifications';

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 20;

const ACTOR_SELECT = {
  id: true,
  username: true,
  displayName: true,
  avatarUrl: true,
} as const;

type GetNotificationsParams = {
  userId: string;
  cursor?: string;
  limit?: number;
};

export function createNotificationsClient() {
  return {
    async notifyFollow({
      recipientId,
      actorId,
    }: {
      recipientId: string;
      actorId: string;
    }): Promise<void> {
      await prisma.notification.create({
        data: { recipientId, actorId, type: 'FOLLOW' },
      });
    },

    async notifyLike({ actorId, postId }: { actorId: string; postId: string }): Promise<void> {
      const post = await prisma.post.findUnique({
        where: { id: postId },
        select: { authorId: true },
      });

      if (!post || post.authorId === actorId) {
        return;
      }

      await prisma.notification.create({
        data: { recipientId: post.authorId, actorId, type: 'LIKE', postId },
      });
    },

    async getNotifications({
      userId,
      cursor,
      limit,
    }: GetNotificationsParams): Promise<NotificationPage> {
      const pageSize = Math.min(limit ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);

      const notifications = await prisma.notification.findMany({
        where: { recipientId: userId },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: pageSize + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        include: {
          actor: { select: ACTOR_SELECT },
          post: { select: { id: true, body: true } },
        },
      });

      const hasMore = notifications.length > pageSize;
      const pageItems = hasMore ? notifications.slice(0, pageSize) : notifications;

      return {
        items: pageItems.map((notification) => ({
          id: notification.id,
          type: notification.type,
          actor: notification.actor,
          createdAt: notification.createdAt.toISOString(),
          post: notification.post,
        })),
        nextCursor: hasMore ? (pageItems[pageItems.length - 1]?.id ?? null) : null,
      };
    },
  };
}
