/**
 * @openspec openspec/specs/node-api-app/spec.md
 * @openspec openspec/specs/notifications/spec.md
 * @change Backend-Phase-3-live-notifications
 */
import { Injectable } from '@nestjs/common';
import type { NotificationItem } from '@repo/types/features/notifications';
import { PrismaService } from '../../prisma.service';
import { RealtimeService } from '../realtime/realtime.service';

const ACTOR_SELECT = {
  id: true,
  username: true,
  displayName: true,
  avatarUrl: true,
} as const;

const NOTIFICATION_INCLUDE = {
  actor: { select: ACTOR_SELECT },
  post: { select: { id: true, body: true } },
} as const;

type NotificationRow = {
  id: string;
  type: 'FOLLOW' | 'LIKE';
  createdAt: Date;
  actor: { id: string; username: string; displayName: string; avatarUrl: string | null };
  post: { id: string; body: string } | null;
};

const toNotificationItem = (row: NotificationRow): NotificationItem => ({
  id: row.id,
  type: row.type,
  actor: row.actor,
  createdAt: row.createdAt.toISOString(),
  post: row.post,
});

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly realtimeService: RealtimeService,
  ) {}

  async notifyFollow({
    recipientId,
    actorId,
  }: {
    recipientId: string;
    actorId: string;
  }): Promise<void> {
    const notification = await this.prismaService.client.notification.create({
      data: { recipientId, actorId, type: 'FOLLOW' },
      include: NOTIFICATION_INCLUDE,
    });

    this.realtimeService.publishToUser(
      recipientId,
      'notification.created',
      toNotificationItem(notification),
    );
  }

  async notifyLike({ actorId, postId }: { actorId: string; postId: string }): Promise<void> {
    const post = await this.prismaService.client.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post || post.authorId === actorId) return;

    const notification = await this.prismaService.client.notification.create({
      data: { recipientId: post.authorId, actorId, type: 'LIKE', postId },
      include: NOTIFICATION_INCLUDE,
    });

    this.realtimeService.publishToUser(
      post.authorId,
      'notification.created',
      toNotificationItem(notification),
    );
  }
}
