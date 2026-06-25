import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { FollowListPage } from '@repo/types/features/follow';

const searchUsersFromBackend = vi.fn();

vi.mock('./backend-search-client', () => ({
  searchUsersFromBackend,
}));

const { loadMoreUserSearchAction } = await import('./actions');

const MOCK_PAGE: FollowListPage = {
  items: [
    { id: 'u1', username: 'alice', displayName: 'Alice', avatarUrl: null, isFollowing: false },
  ],
  nextCursor: 'next-123',
};

describe('loadMoreUserSearchAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls backend search client with query and cursor', async () => {
    searchUsersFromBackend.mockResolvedValue(MOCK_PAGE);

    const result = await loadMoreUserSearchAction('alice', 'cursor-abc');

    expect(searchUsersFromBackend).toHaveBeenCalledWith({
      query: 'alice',
      cursor: 'cursor-abc',
    });
    expect(result).toEqual(MOCK_PAGE);
  });

  it('forwards viewerId when provided', async () => {
    searchUsersFromBackend.mockResolvedValue(MOCK_PAGE);

    await loadMoreUserSearchAction('bob', 'cursor-xyz', 'viewer-1');

    expect(searchUsersFromBackend).toHaveBeenCalledWith({
      query: 'bob',
      cursor: 'cursor-xyz',
      viewerId: 'viewer-1',
    });
  });

  it('propagates errors from backend client', async () => {
    searchUsersFromBackend.mockRejectedValue(new Error('Backend search request failed: 500'));

    await expect(loadMoreUserSearchAction('alice', 'cursor-abc')).rejects.toThrow(
      'Backend search request failed: 500',
    );
  });
});
