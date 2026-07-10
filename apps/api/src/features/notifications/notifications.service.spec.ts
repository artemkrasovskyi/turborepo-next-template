import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../../prisma.service';
import type { RealtimeService } from '../realtime/realtime.service';
import { NotificationsService } from './notifications.service';

const mockNotificationCreate = vi.hoisted(() => vi.fn());
const mockPostFindUnique = vi.hoisted(() => vi.fn());

vi.mock('@repo/shared/features/database', () => ({
  prisma: {
    notification: { create: mockNotificationCreate },
    post: { findUnique: mockPostFindUnique },
  },
}));

const makeNotificationRow = (overrides: Partial<{
  id: string;
  type: 'FOLLOW' | 'LIKE';
  createdAt: Date;
  actor: { id: string; username: string; displayName: string; avatarUrl: string | null };
  post: { id: string; body: string } | null;
}> = {}) => ({
  id: 'notif-1',
  type: 'FOLLOW' as const,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  actor: { id: 'actor-1', username: 'alice', displayName: 'Alice', avatarUrl: null },
  post: null,
  ...overrides,
});

describe('NotificationsService', () => {
  let service: NotificationsService;
  let mockPublishToUser: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockNotificationCreate.mockReset();
    mockPostFindUnique.mockReset();

    mockPublishToUser = vi.fn().mockReturnValue({ sent: 1, failed: 0 });
    const realtimeService = { publishToUser: mockPublishToUser } as unknown as RealtimeService;
    const prismaService = new PrismaService();
    service = new NotificationsService(prismaService, realtimeService);
  });

  describe('notifyFollow', () => {
    it('persists the follow notification in Prisma', async () => {
      mockNotificationCreate.mockResolvedValue(makeNotificationRow());
      await service.notifyFollow({ recipientId: 'recipient-1', actorId: 'actor-1' });
      expect(mockNotificationCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { recipientId: 'recipient-1', actorId: 'actor-1', type: 'FOLLOW' },
        }),
      );
    });

    it('publishes notification.created to recipient after persistence', async () => {
      mockNotificationCreate.mockResolvedValue(makeNotificationRow());
      await service.notifyFollow({ recipientId: 'recipient-1', actorId: 'actor-1' });
      expect(mockPublishToUser).toHaveBeenCalledWith(
        'recipient-1',
        'notification.created',
        expect.objectContaining({ id: 'notif-1', type: 'FOLLOW' }),
      );
    });

    it('maps notification to NotificationItem shape', async () => {
      mockNotificationCreate.mockResolvedValue(makeNotificationRow({
        id: 'notif-42',
        type: 'FOLLOW',
        createdAt: new Date('2026-06-01T12:00:00.000Z'),
        actor: { id: 'actor-1', username: 'alice', displayName: 'Alice', avatarUrl: null },
        post: null,
      }));
      await service.notifyFollow({ recipientId: 'recipient-1', actorId: 'actor-1' });
      const payload = mockPublishToUser.mock.calls[0][2];
      expect(payload).toEqual({
        id: 'notif-42',
        type: 'FOLLOW',
        actor: { id: 'actor-1', username: 'alice', displayName: 'Alice', avatarUrl: null },
        createdAt: '2026-06-01T12:00:00.000Z',
        post: null,
      });
    });

    it('payload does not include private fields', async () => {
      mockNotificationCreate.mockResolvedValue(makeNotificationRow());
      await service.notifyFollow({ recipientId: 'recipient-1', actorId: 'actor-1' });
      const payload = mockPublishToUser.mock.calls[0][2];
      expect(payload).not.toHaveProperty('recipientId');
      expect(payload).not.toHaveProperty('actorId');
      expect(Object.keys(payload)).toEqual(['id', 'type', 'actor', 'createdAt', 'post']);
    });

    it('still persists notification even when no active connection exists (sent=0)', async () => {
      mockPublishToUser.mockReturnValue({ sent: 0, failed: 0 });
      mockNotificationCreate.mockResolvedValue(makeNotificationRow());
      await service.notifyFollow({ recipientId: 'recipient-1', actorId: 'actor-1' });
      expect(mockNotificationCreate).toHaveBeenCalledTimes(1);
    });
  });

  describe('notifyLike', () => {
    it('persists and publishes like notification for another user’s post', async () => {
      mockPostFindUnique.mockResolvedValue({ authorId: 'author-1' });
      mockNotificationCreate.mockResolvedValue(makeNotificationRow({ type: 'LIKE', post: { id: 'post-1', body: 'Hello' } }));
      await service.notifyLike({ actorId: 'actor-1', postId: 'post-1' });
      expect(mockNotificationCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { recipientId: 'author-1', actorId: 'actor-1', type: 'LIKE', postId: 'post-1' },
        }),
      );
      expect(mockPublishToUser).toHaveBeenCalledWith(
        'author-1',
        'notification.created',
        expect.objectContaining({ type: 'LIKE' }),
      );
    });

    it('does not create notification or publish for self-like', async () => {
      mockPostFindUnique.mockResolvedValue({ authorId: 'actor-1' });
      await service.notifyLike({ actorId: 'actor-1', postId: 'post-1' });
      expect(mockNotificationCreate).not.toHaveBeenCalled();
      expect(mockPublishToUser).not.toHaveBeenCalled();
    });

    it('does not create notification or publish when post does not exist', async () => {
      mockPostFindUnique.mockResolvedValue(null);
      await service.notifyLike({ actorId: 'actor-1', postId: 'nonexistent' });
      expect(mockNotificationCreate).not.toHaveBeenCalled();
      expect(mockPublishToUser).not.toHaveBeenCalled();
    });

    it('still persists like notification when recipient has no active connections', async () => {
      mockPublishToUser.mockReturnValue({ sent: 0, failed: 0 });
      mockPostFindUnique.mockResolvedValue({ authorId: 'author-1' });
      mockNotificationCreate.mockResolvedValue(makeNotificationRow({ type: 'LIKE' }));
      await service.notifyLike({ actorId: 'actor-1', postId: 'post-1' });
      expect(mockNotificationCreate).toHaveBeenCalledTimes(1);
    });
  });
});
