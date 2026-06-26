'use server';

import { createFeedClient } from '@repo/api-client/features/feed';
import type { FeedPage } from '@repo/types/features/feed';

const feedClient = createFeedClient();

export const loadMoreFeedAction = async (viewerId: string, cursor: string): Promise<FeedPage> =>
  feedClient.getHomeFeed({ viewerId, cursor });
