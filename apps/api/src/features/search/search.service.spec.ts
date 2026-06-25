import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../../prisma.service';
import { SearchService } from './search.service';

const mockUserFindMany = vi.hoisted(() => vi.fn());
const mockFollowFindMany = vi.hoisted(() => vi.fn());

vi.mock('@repo/shared/features/database', () => ({
  prisma: {
    user: { findMany: mockUserFindMany },
    follow: { findMany: mockFollowFindMany },
  },
}));

describe('SearchService', () => {
  let service: SearchService;

  beforeEach(() => {
    mockUserFindMany.mockReset();
    mockFollowFindMany.mockReset();
    const prismaService = new PrismaService();
    service = new SearchService(prismaService);
  });

  it('returns empty page for empty query without DB call', async () => {
    const result = await service.searchUsers({ query: '' });
    expect(result).toEqual({ items: [], nextCursor: null });
    expect(mockUserFindMany).not.toHaveBeenCalled();
  });

  it('returns empty page for whitespace-only query without DB call', async () => {
    const result = await service.searchUsers({ query: '   ' });
    expect(result).toEqual({ items: [], nextCursor: null });
    expect(mockUserFindMany).not.toHaveBeenCalled();
  });

  it('calls Prisma findMany with correct where/take/order args', async () => {
    mockUserFindMany.mockResolvedValue([]);
    await service.searchUsers({ query: 'alice', limit: 10 });
    expect(mockUserFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          OR: [
            { username: { contains: 'alice', mode: 'insensitive' } },
            { displayName: { contains: 'alice', mode: 'insensitive' } },
          ],
        },
        take: 11,
        orderBy: { createdAt: 'asc' },
      }),
    );
  });

  it('includes cursor args when cursor is provided', async () => {
    mockUserFindMany.mockResolvedValue([]);
    await service.searchUsers({ query: 'bob', cursor: 'cursor-id-123' });
    expect(mockUserFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 1,
        cursor: { id: 'cursor-id-123' },
      }),
    );
  });

  it('sets nextCursor when extra record is returned', async () => {
    const users = Array.from({ length: 21 }, (_, i) => ({
      id: `user-${i}`,
      username: `user${i}`,
      displayName: `User ${i}`,
      avatarUrl: null,
    }));
    mockUserFindMany.mockResolvedValue(users);
    mockFollowFindMany.mockResolvedValue([]);
    const result = await service.searchUsers({ query: 'user', viewerId: 'viewer-1' });
    expect(result.nextCursor).toBe('user-19');
    expect(result.items).toHaveLength(20);
  });

  it('sets nextCursor to null when no extra record', async () => {
    const users = Array.from({ length: 5 }, (_, i) => ({
      id: `user-${i}`,
      username: `user${i}`,
      displayName: `User ${i}`,
      avatarUrl: null,
    }));
    mockUserFindMany.mockResolvedValue(users);
    mockFollowFindMany.mockResolvedValue([]);
    const result = await service.searchUsers({ query: 'user', viewerId: 'viewer-1' });
    expect(result.nextCursor).toBeNull();
    expect(result.items).toHaveLength(5);
  });

  it('triggers follow batch lookup when viewerId is supplied', async () => {
    const users = [
      { id: 'u1', username: 'alice', displayName: 'Alice', avatarUrl: null },
      { id: 'u2', username: 'bob', displayName: 'Bob', avatarUrl: null },
    ];
    mockUserFindMany.mockResolvedValue(users);
    mockFollowFindMany.mockResolvedValue([{ followingId: 'u1' }]);
    const result = await service.searchUsers({ query: 'alice', viewerId: 'viewer-1' });
    expect(mockFollowFindMany).toHaveBeenCalledWith({
      where: {
        followerId: 'viewer-1',
        followingId: { in: ['u1', 'u2'] },
      },
      select: { followingId: true },
    });
    expect(result.items[0]?.isFollowing).toBe(true);
    expect(result.items[1]?.isFollowing).toBe(false);
  });

  it('sets isFollowing false for all when no viewerId', async () => {
    const users = [
      { id: 'u1', username: 'alice', displayName: 'Alice', avatarUrl: null },
    ];
    mockUserFindMany.mockResolvedValue(users);
    const result = await service.searchUsers({ query: 'alice' });
    expect(mockFollowFindMany).not.toHaveBeenCalled();
    expect(result.items[0]?.isFollowing).toBe(false);
  });

  it('returned objects contain only id/username/displayName/avatarUrl/isFollowing', async () => {
    const users = [
      {
        id: 'u1',
        username: 'alice',
        displayName: 'Alice',
        avatarUrl: 'https://example.com/avatar.png',
      },
    ];
    mockUserFindMany.mockResolvedValue(users);
    const result = await service.searchUsers({ query: 'alice' });
    const item = result.items[0];
    expect(item).toBeDefined();
    expect(Object.keys(item!)).toEqual([
      'id',
      'username',
      'displayName',
      'avatarUrl',
      'isFollowing',
    ]);
  });
});
