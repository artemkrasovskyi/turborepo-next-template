'use server';

import { createFeedClient } from '@repo/api-client/features/feed';
import type { FeedPage } from '@repo/types/features/feed';

const feedClient = createFeedClient();

export async function loadMoreFeedAction(viewerId: string, cursor: string): Promise<FeedPage> {
  return feedClient.getHomeFeed({ viewerId, cursor });
}
