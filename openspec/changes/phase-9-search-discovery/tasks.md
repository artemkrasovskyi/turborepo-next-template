## API client

1. Create `packages/api-client/src/features/search/index.ts` with `createSearchClient()` — `searchUsers` (cursor-paginated, batch isFollowing), `getRecentUsers` (fixed 12, batch isFollowing), `getTrendingPosts` (fixed 20, last 7 days, ordered by like count)
2. Add `"./features/search": "./src/features/search/index.ts"` export to `packages/api-client/package.json`

## Server actions

3. Create `apps/main/src/features/search/actions.ts` — `loadMoreUserSearchAction(query, cursor, viewerId?)`

## Components

4. Create `search-bar.tsx` — client component, controlled input, pushes `/explore?q=` on submit
5. Create `user-search-results.tsx` — client component, initial page + load-more via `loadMoreUserSearchAction`, renders `FollowUserCard` per result
6. Create `recent-users.tsx` — server component, renders a grid of `FollowUserCard`s with empty state
7. Create `trending-posts.tsx` — server component, renders a list of `FeedItem`s with empty state

## Route

8. Create `apps/main/src/app/explore/page.tsx` — reads `searchParams.q`; shows `UserSearchResults` when query present, `RecentUsers` + `TrendingPosts` when absent
9. Create `apps/main/src/app/explore/loading.tsx` — search bar skeleton + two section skeletons

## Nav bar

10. Add Explore link to `apps/main/src/features/nav/components/nav-bar.tsx` between Home and Notifications