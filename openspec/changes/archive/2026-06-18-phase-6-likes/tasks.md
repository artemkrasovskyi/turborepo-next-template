## 1. API Client — getLikedPosts

- [x] 1.1 Add `getLikedPosts` function to `packages/api-client/src/features/likes/index.ts` — query `Like` records for a given `userId`, include full post data with `likeCount` and `viewerHasLiked`, ordered by `Like.createdAt` descending, return `FeedPage`
- [x] 1.2 Add cursor-based pagination to `getLikedPosts` (same `take + 1` pattern used in feed and profile clients)
- [x] 1.3 Export `getLikedPosts` params type from `packages-types/src/features/likes/index.ts` if needed

## 2. Profile — Likes Tab UI

- [x] 2.1 Create `apps/main/src/features/profile/components/profile-tabs.tsx` — client component using `usePathname` to render Posts/Likes tab bar with active state
- [x] 2.2 Add `ProfileTabs` to `apps/main/src/features/profile/components/profile-header.tsx` beneath the header content
- [x] 2.3 Update `apps/main/src/app/profile/[username]/page.tsx` to render `ProfileTabs`

## 3. Liked Posts Page

- [x] 3.1 Create `apps/main/src/features/likes/components/liked-posts.tsx` — async server component that calls `getLikedPosts` and renders `FeedItem` list with empty state
- [x] 3.2 Create `apps/main/src/features/likes/components/liked-posts-load-more-button.tsx` — client component mirroring `ProfileLoadMoreButton` for the liked-posts cursor
- [x] 3.3 Create `apps/main/src/app/profile/[username]/likes/page.tsx` — server page that resolves viewer, fetches profile (for not-found handling), renders `ProfileHeader`, `ProfileTabs`, and `LikedPosts`
- [x] 3.4 Add `loading.tsx` for `apps/main/src/app/profile/[username]/likes/` route segment

## 4. Verification

- [x] 4.1 Run `bun run typecheck` — no type errors
- [x] 4.2 Run `bun run lint` — no lint errors
- [ ] 4.3 Manually verify: like a post on the feed, navigate to `/profile/<username>/likes`, confirm the post appears
- [ ] 4.4 Manually verify: unlike the post, reload the likes page, confirm it disappears
- [ ] 4.5 Manually verify: profile tabs switch between Posts and Likes with correct active state
- [ ] 4.6 Manually verify: empty state shown when a user has no liked posts
