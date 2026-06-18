'use server';

import { createSearchClient } from '@repo/api-client/features/search';
import type { FollowListPage } from '@repo/types/features/follow';

const searchClient = createSearchClient();

export async function loadMoreUserSearchAction(
  query: string,
  cursor: string,
  viewerId?: string,
): Promise<FollowListPage> {
  return searchClient.searchUsers({ query, viewerId, cursor });
}
