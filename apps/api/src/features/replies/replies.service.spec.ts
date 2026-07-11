import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../../prisma.service';
import type { RealtimeService } from '../realtime/realtime.service';
import { RepliesService } from './replies.service';

const mockPostCreate = vi.hoisted(() => vi.fn());
const mockPostImageCreateMany = vi.hoisted(() => vi.fn());
const mockPostFindUniqueOrThrow = vi.hoisted(() => vi.fn());
const mockTransaction = vi.hoisted(() => vi.fn());

vi.mock('@repo/shared/features/database', () => ({
  prisma: {
    post: {
      create: mockPostCreate,
      findUniqueOrThrow: mockPostFindUniqueOrThrow,
    },
    postImage: { createMany: mockPostImageCreateMany },
    $transaction: mockTransaction,
  },
}));

const makeReplyRow = (overrides: Partial<{
  id: string;
  body: string;
  createdAt: Date;
  author: { id: string; username: string; displayName: string; avatarUrl: string | null };
  images: { id: string; url: string; order: number }[];
}> = {}) => ({
  id: 'reply-1',
  body: 'Hello',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  author: { id: 'author-1', username: 'alice', displayName: 'Alice', avatarUrl: null },
  images: [],
  ...overrides,
});

describe('RepliesService', () => {
  let service: RepliesService;
  let mockPublishToThread: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockPostCreate.mockReset();
    mockPostImageCreateMany.mockReset();
    mockPostFindUniqueOrThrow.mockReset();
    mockTransaction.mockReset();

    mockPublishToThread = vi.fn().mockReturnValue({ sent: 1, failed: 0 });
    const realtimeService = { publishToThread: mockPublishToThread } as unknown as RealtimeService;
    const prismaService = new PrismaService();
    service = new RepliesService(prismaService, realtimeService);
  });

  describe('createReply without images', () => {
    it('persists the reply in Prisma', async () => {
      mockPostCreate.mockResolvedValue(makeReplyRow());
      await service.createReply({ authorId: 'author-1', parentId: 'root-1', body: 'Hello' });
      expect(mockPostCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { authorId: 'author-1', parentId: 'root-1', body: 'Hello' },
        }),
      );
    });

    it('publishes reply.created to the thread after persistence', async () => {
      mockPostCreate.mockResolvedValue(makeReplyRow());
      await service.createReply({ authorId: 'author-1', parentId: 'root-1', body: 'Hello' });
      expect(mockPublishToThread).toHaveBeenCalledWith(
        'root-1',
        'reply.created',
        expect.objectContaining({
          threadId: 'root-1',
          reply: expect.objectContaining({ id: 'reply-1' }),
        }),
      );
    });

    it('maps the persisted reply to the ThreadPost shape', async () => {
      mockPostCreate.mockResolvedValue(makeReplyRow({
        id: 'reply-42',
        body: 'Hi there',
        createdAt: new Date('2026-06-01T12:00:00.000Z'),
      }));
      await service.createReply({ authorId: 'author-1', parentId: 'root-1', body: 'Hi there' });
      const payload = mockPublishToThread.mock.calls[0][2];
      expect(payload.reply).toEqual({
        id: 'reply-42',
        body: 'Hi there',
        createdAt: '2026-06-01T12:00:00.000Z',
        author: { id: 'author-1', username: 'alice', displayName: 'Alice', avatarUrl: null },
        likeCount: 0,
        isLikedByViewer: false,
        isBookmarkedByViewer: false,
        images: [],
      });
    });

    it('payload includes threadId, reply, and an ISO timestamp only', async () => {
      mockPostCreate.mockResolvedValue(makeReplyRow());
      await service.createReply({ authorId: 'author-1', parentId: 'root-1', body: 'Hello' });
      const payload = mockPublishToThread.mock.calls[0][2];
      expect(Object.keys(payload).sort()).toEqual(['reply', 'threadId', 'timestamp']);
      expect(new Date(payload.timestamp).toISOString()).toBe(payload.timestamp);
    });

    it('payload does not include private fields', async () => {
      mockPostCreate.mockResolvedValue(makeReplyRow());
      await service.createReply({ authorId: 'author-1', parentId: 'root-1', body: 'Hello' });
      const payload = mockPublishToThread.mock.calls[0][2];
      expect(payload.reply).not.toHaveProperty('authorId');
      expect(payload.reply.author).not.toHaveProperty('email');
    });

    it('still persists the reply even when no active thread connections exist (sent=0)', async () => {
      mockPublishToThread.mockReturnValue({ sent: 0, failed: 0 });
      mockPostCreate.mockResolvedValue(makeReplyRow());
      await service.createReply({ authorId: 'author-1', parentId: 'root-1', body: 'Hello' });
      expect(mockPostCreate).toHaveBeenCalledTimes(1);
    });

    it('returns the created reply id', async () => {
      mockPostCreate.mockResolvedValue(makeReplyRow({ id: 'reply-99' }));
      const result = await service.createReply({ authorId: 'author-1', parentId: 'root-1', body: 'Hello' });
      expect(result).toEqual({ id: 'reply-99' });
    });

    it('does not publish when reply persistence fails', async () => {
      mockPostCreate.mockRejectedValue(new Error('db error'));
      await expect(
        service.createReply({ authorId: 'author-1', parentId: 'root-1', body: 'Hello' }),
      ).rejects.toThrow('db error');
      expect(mockPublishToThread).not.toHaveBeenCalled();
    });
  });

  describe('createReply with images', () => {
    it('persists the reply and images inside a transaction, then publishes', async () => {
      const txPostCreate = vi.fn().mockResolvedValue({ id: 'reply-1' });
      const txPostImageCreateMany = vi.fn().mockResolvedValue({ count: 1 });
      const txPostFindUniqueOrThrow = vi.fn().mockResolvedValue(
        makeReplyRow({ images: [{ id: 'img-1', url: 'https://example.com/a.png', order: 0 }] }),
      );
      mockTransaction.mockImplementation(async (callback) =>
        callback({
          post: { create: txPostCreate, findUniqueOrThrow: txPostFindUniqueOrThrow },
          postImage: { createMany: txPostImageCreateMany },
        }),
      );

      const result = await service.createReply({
        authorId: 'author-1',
        parentId: 'root-1',
        body: 'Hello',
        imageUrls: ['https://example.com/a.png'],
      });

      expect(txPostCreate).toHaveBeenCalledWith(
        expect.objectContaining({ data: { authorId: 'author-1', parentId: 'root-1', body: 'Hello' } }),
      );
      expect(txPostImageCreateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          data: [{ postId: 'reply-1', url: 'https://example.com/a.png', order: 0 }],
        }),
      );
      expect(result).toEqual({ id: 'reply-1' });
      expect(mockPublishToThread).toHaveBeenCalledWith(
        'root-1',
        'reply.created',
        expect.objectContaining({
          reply: expect.objectContaining({
            images: [{ id: 'img-1', url: 'https://example.com/a.png', order: 0 }],
          }),
        }),
      );
    });
  });
});
