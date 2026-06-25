'use server';

/**
 * @openspec openspec/specs/frontend-search/spec.md
 * @change Phase-19-search-module
 */

import type { FollowListPage } from '@repo/types/features/follow';
import { searchUsersFromBackend } from './backend-search-client';

export async function loadMoreUserSearchAction(
  query: string,
  cursor: string,
  viewerId?: string,
): Promise<FollowListPage> {
  return searchUsersFromBackend({ query, cursor, ...(viewerId ? { viewerId } : {}) });
}
