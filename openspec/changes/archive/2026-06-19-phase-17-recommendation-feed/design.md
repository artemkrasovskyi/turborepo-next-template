## Context

Flock currently has two discovery surfaces:
- the home feed, which is chronological and limited to the viewer's own posts plus posts/reposts from followed users
- `/explore`, which supports user search, recent users, and trending posts

The current `/explore` landing page is not personalized beyond viewer follow state. Phase 17
upgrades the no-query Explore landing page into a recommendation feed with:
- suggested users
- recommended posts
- a deterministic ranking algorithm

User search at `/explore?q=<query>` remains unchanged.

## Goals / Non-Goals

**Goals:**
- Add suggested users to the Explore landing page
- Add recommended posts to the Explore landing page
- Rank recommendations with a deterministic, explainable MVP heuristic
- Reuse existing follow cards and feed cards wherever possible
- Keep `/explore?q=` user search behavior unchanged
- Avoid schema changes for MVP by deriving scores from existing users, follows, posts, replies, likes, reposts, bookmarks, and post images

**Non-Goals:**
- Machine-learning ranking
- Analytics/event tracking
- Real-time personalization
- Sponsored or promoted recommendations
- Recommended direct messages or private content
- Recommendation notifications
- New persistent ranking/materialized-score tables
- Replacing the chronological home feed

## Decisions

### Explore landing becomes the recommendation surface

When `/explore` has no `q` search parameter, it should render:
- `Suggested users`
- `Recommended posts`

When `q` is present and non-empty, the existing user search flow continues to render search
results. This keeps discovery in one route and avoids adding a second nav item.

### New recommendations API client feature

Create `packages/api-client/src/features/recommendations/index.ts` with:

```ts
export function createRecommendationsClient() {
  return {
    async getSuggestedUsers(params: GetSuggestedUsersParams): Promise<FollowListPage>,
    async getRecommendedPosts(params: GetRecommendedPostsParams): Promise<FeedPage>,
  };
}
```

Add `"./features/recommendations"` to `packages/api-client/package.json` exports.

Use existing shared types where possible:
- `FollowListUser` / `FollowListPage` for suggested users
- `FeedPost` / `FeedPage` for recommended posts

Add `@repo/types/features/recommendations` only if implementation needs public constants or result
types that cannot be represented by existing types.

### Suggested users ranking

Suggested users should exclude:
- the viewer
- users already followed by the viewer

Candidate sources:
1. Users followed by people the viewer follows (social proximity)
2. Recently active users who authored a post recently
3. Recently joined users as fallback

Ranking should be deterministic:

```txt
score =
  mutualFollowedByCount * 100
  + followerCount * 3
  + recentPostCount7d * 5
  + accountRecencyBoost
```

Tie-breakers:
1. score descending
2. `createdAt` descending
3. `id` descending

`accountRecencyBoost` should be small enough that social proximity remains the dominant signal.

### Recommended posts ranking

Recommended posts should include only top-level posts. Replies remain discoverable through their
threads and are out of scope for MVP recommendations.

Recommended posts should exclude:
- posts authored by the viewer
- posts from authors the viewer already follows when practical, because those already belong in the home feed

Candidate sources:
1. Posts liked or reposted by users the viewer follows
2. Posts by authors followed by users the viewer follows
3. Public posts with recent engagement as fallback

Ranking should be deterministic and explainable:

```txt
score =
  followedUserEngagementCount * 80
  + authorFollowedByFollowedUsersCount * 50
  + likeCount * 4
  + repostCount * 8
  + replyCount * 2
  + recencyBoost
```

`recencyBoost` should favor posts from the last 7 days, decay after that, and never outweigh strong
social proximity.

Tie-breakers:
1. score descending
2. `createdAt` descending
3. `id` descending

### Pagination and cursors

Both recommendation lists should use the existing load-more pattern.

Because ranking is computed in application code, cursors should be stable enough for MVP:
- Suggested users cursor: last returned user id
- Recommended posts cursor: last returned post id

The implementation may over-fetch candidates, compute scores in memory, sort, then slice to
`pageSize + 1`. This is acceptable for MVP page sizes.

### UI composition

Update `/explore` landing mode only:
- Replace or extend recent users with `Suggested users`
- Replace or extend trending posts with `Recommended posts`

Recommended components:
- `SuggestedUsers` server component
- `SuggestedUsersLoadMoreButton` client component
- `RecommendedPosts` server component
- `RecommendedPostsLoadMoreButton` client component

Suggested users reuse `FollowUserCard`.
Recommended posts reuse `FeedItem`.

### Ranking transparency

The ranking algorithm should live in small pure helper functions inside the recommendations API
feature so it can be unit tested independently from Prisma queries. Keep score weights named
constants in the same module.

Do not show ranking explanations in the UI for MVP.

## Risks / Trade-offs

- **In-memory scoring cost**: over-fetching and scoring candidates in memory is simple and type-safe,
  but not suitable for very large datasets. Acceptable for MVP.
- **Cursor drift**: score-based ordering can change between requests as engagement changes. Existing
  MVP feeds already accept lightweight pagination trade-offs.
- **Filter strictness**: excluding followed authors may leave sparse recommendations for new users.
  The fallback candidate source should still return recent engaged posts.
- **Explainability vs quality**: heuristic ranking is less sophisticated than ML but predictable,
  testable, and appropriate for the current product stage.
