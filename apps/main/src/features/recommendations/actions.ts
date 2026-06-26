'use server';

import { createRecommendationsClient } from '@repo/api-client/features/recommendations';
import type { FeedPage } from '@repo/types/features/feed';
import type { FollowListPage } from '@repo/types/features/follow';

const recommendationsClient = createRecommendationsClient();

export const loadMoreSuggestedUsersAction = async (
  cursor: string,
  viewerId?: string,
): Promise<FollowListPage> => recommendationsClient.getSuggestedUsers({ viewerId, cursor });

export const loadMoreRecommendedPostsAction = async (
  cursor: string,
  viewerId?: string,
): Promise<FeedPage> => recommendationsClient.getRecommendedPosts({ viewerId, cursor });
