import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { FollowListPage } from '@repo/types/features/follow';
import { searchUsersFromBackend } from './backend-search-client';

const MOCK_PAGE: FollowListPage = {
  items: [
    { id: 'u1', username: 'alice', displayName: 'Alice', avatarUrl: null, isFollowing: false },
  ],
  nextCursor: null,
};

describe('searchUsersFromBackend', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => MOCK_PAGE,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('calls GET /search/users with query parameter', async () => {
    await searchUsersFromBackend({ query: 'alice' });

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url] = fetchMock.mock.calls[0] as [string, unknown];
    const parsed = new URL(url);
    expect(parsed.pathname).toBe('/search/users');
    expect(parsed.searchParams.get('query')).toBe('alice');
  });

  it('encodes cursor when provided', async () => {
    await searchUsersFromBackend({ query: 'bob', cursor: 'cursor-123' });

    const [url] = fetchMock.mock.calls[0] as [string, unknown];
    const parsed = new URL(url);
    expect(parsed.searchParams.get('cursor')).toBe('cursor-123');
  });

  it('encodes limit when provided', async () => {
    await searchUsersFromBackend({ query: 'bob', limit: 5 });

    const [url] = fetchMock.mock.calls[0] as [string, unknown];
    const parsed = new URL(url);
    expect(parsed.searchParams.get('limit')).toBe('5');
  });

  it('encodes viewerId when provided', async () => {
    await searchUsersFromBackend({ query: 'bob', viewerId: 'viewer-42' });

    const [url] = fetchMock.mock.calls[0] as [string, unknown];
    const parsed = new URL(url);
    expect(parsed.searchParams.get('viewerId')).toBe('viewer-42');
  });

  it('does not include cursor, limit, viewerId when absent', async () => {
    await searchUsersFromBackend({ query: 'test' });

    const [url] = fetchMock.mock.calls[0] as [string, unknown];
    const parsed = new URL(url);
    expect(parsed.searchParams.has('cursor')).toBe(false);
    expect(parsed.searchParams.has('limit')).toBe(false);
    expect(parsed.searchParams.has('viewerId')).toBe(false);
  });

  it('returns FollowListPage on success', async () => {
    const result = await searchUsersFromBackend({ query: 'alice' });

    expect(result).toEqual(MOCK_PAGE);
  });

  it('throws on non-2xx response', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    await expect(searchUsersFromBackend({ query: 'alice' })).rejects.toThrow(
      'Backend search request failed: 500 Internal Server Error',
    );
  });

  it('throws on 404 response', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    });

    await expect(searchUsersFromBackend({ query: 'alice' })).rejects.toThrow(
      'Backend search request failed: 404 Not Found',
    );
  });
});
