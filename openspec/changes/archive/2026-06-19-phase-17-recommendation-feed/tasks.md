## 1. Shared Types

- [x] 1.1 Confirm existing `FollowListPage` and `FeedPage` types cover suggested users and recommended posts
- [x] 1.2 Create `packages-types/src/features/recommendations/index.ts` only if implementation needs exported ranking constants or new result types
- [x] 1.3 Add package export for `"./features/recommendations"` only if a shared recommendations type module is created

## 2. Recommendations API Client

- [x] 2.1 Create `packages/api-client/src/features/recommendations/index.ts` with `createRecommendationsClient()`
- [x] 2.2 Add `"./features/recommendations"` to `packages/api-client/package.json` exports
- [x] 2.3 Implement `getSuggestedUsers({ viewerId, cursor, limit })` returning `FollowListPage`
- [x] 2.4 Implement `getRecommendedPosts({ viewerId, cursor, limit })` returning `FeedPage`
- [x] 2.5 Add pure helper functions for suggested-user scoring and recommended-post scoring
- [x] 2.6 Keep ranking weights as named constants near the scoring helpers

## 3. Suggested Users

- [x] 3.1 Exclude the viewer from suggested users
- [x] 3.2 Exclude users already followed by the viewer
- [x] 3.3 Include candidates followed by users the viewer follows
- [x] 3.4 Include recently active users as a fallback source
- [x] 3.5 Include recently joined users as a final fallback source
- [x] 3.6 Rank by social proximity, follower count, recent post activity, and small account-recency boost
- [x] 3.7 Return viewer follow state for every suggested user

## 4. Recommended Posts

- [x] 4.1 Restrict recommended posts to top-level posts
- [x] 4.2 Exclude posts authored by the viewer
- [x] 4.3 Exclude posts from followed authors when practical
- [x] 4.4 Include candidates liked or reposted by users the viewer follows
- [x] 4.5 Include candidates from authors followed by users the viewer follows
- [x] 4.6 Include recently engaged public posts as fallback candidates
- [x] 4.7 Rank by followed-user engagement, author social proximity, likes, reposts, replies, and recency boost
- [x] 4.8 Map posts to `FeedPost` with author, counts, viewer like/repost/bookmark state, images, and repost compatibility fields

## 5. Explore UI

- [x] 5.1 Update `/explore` no-query landing mode to render `Suggested users`
- [x] 5.2 Update `/explore` no-query landing mode to render `Recommended posts`
- [x] 5.3 Preserve existing `/explore?q=<query>` user search behavior
- [x] 5.4 Create suggested-users load-more action and component if result pagination is enabled
- [x] 5.5 Create recommended-posts load-more action and component
- [x] 5.6 Reuse `FollowUserCard` for suggested users
- [x] 5.7 Reuse `FeedItem` for recommended posts
- [x] 5.8 Update `/explore/loading.tsx` skeletons if needed

## 6. Tests

- [x] 6.1 Add unit tests for suggested-user score ordering
- [x] 6.2 Add unit tests for recommended-post score ordering
- [ ] 6.3 Add API-client tests that suggested users exclude viewer and already-followed users
- [ ] 6.4 Add API-client tests that recommended posts exclude viewer-authored posts
- [ ] 6.5 Add API-client tests for fallback candidates when social graph data is sparse
- [ ] 6.6 Add focused UI/action tests or manual checks for `/explore` no-query recommendations
- [ ] 6.7 Add focused UI/action tests or manual checks that `/explore?q=` search still works


## 7. Verification

- [x] 7.1 Run `bun run typecheck`
- [x] 7.2 Run focused lint for new and touched recommendation/search files
- [x] 7.3 Run ranking helper and API-client tests
- [ ] 7.4 Manually verify suggested users are not already followed
- [ ] 7.5 Manually verify recommended posts are not from the viewer
- [ ] 7.6 Manually verify recommended posts order changes predictably when engagement/social proximity changes
