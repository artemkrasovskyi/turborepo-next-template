'use server';

import { createRecommendationsClient } from '@repo/api-client/features/recommendations';
import type { FeedPage } from '@repo/types/features/feed';
import type { FollowListPage } from '@repo/types/features/follow';

const recommendationsClient = createRecommendationsClient();

export async function loadMoreSuggestedUsersAction(
  cursor: string,
  viewerId?: string,
): Promise<FollowListPage> {
  return recommendationsClient.getSuggestedUsers({ viewerId, cursor });
}

export async function loadMoreRecommendedPostsAction(
  cursor: string,
  viewerId?: string,
): Promise<FeedPage> {
  return recommendationsClient.getRecommendedPosts({ viewerId, cursor });
}
