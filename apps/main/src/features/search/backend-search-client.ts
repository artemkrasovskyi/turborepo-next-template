/**
 * @openspec openspec/specs/frontend-search/spec.md
 * @change Phase-19-search-module
 */
import 'server-only';

import type { FollowListPage } from '@repo/types/features/follow';

const API_BASE_URL = process.env['API_BASE_URL'] ?? 'http://localhost:3002';

type SearchUsersParams = {
  query: string;
  cursor?: string | undefined;
  limit?: number | undefined;
  viewerId?: string | undefined;
};

export const searchUsersFromBackend = async ({
  query,
  cursor,
  limit,
  viewerId,
}: SearchUsersParams): Promise<FollowListPage> => {
  const url = new URL('/search/users', API_BASE_URL);

  url.searchParams.set('query', query);

  if (cursor) {
    url.searchParams.set('cursor', cursor);
  }

  if (limit !== undefined) {
    url.searchParams.set('limit', String(limit));
  }

  if (viewerId) {
    url.searchParams.set('viewerId', viewerId);
  }

  const response = await fetch(url.toString(), { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`Backend search request failed: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<FollowListPage>;
};
