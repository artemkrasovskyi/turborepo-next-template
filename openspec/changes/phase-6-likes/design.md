## Context

Most of the likes infrastructure is already in place from earlier phases:

- `createLikesClient()` in `@repo/api-client` exposes `like` and `unlike`
- `toggleLikeAction` server action handles optimistic toggling with notification side-effect
- `LikeButton` component in `apps/main/src/features/likes/components/like-button.tsx` handles optimistic state, error revert, and unauthenticated display
- `FeedPost` type already carries `likeCount` and `isLikedByViewer`
- `ToggleLikeResult` type is defined in `@repo/types/features/likes`

What remains is the **User Likes page** (`/profile/[username]/likes`) and the **Likes tab** on the profile page. The `LikeButton` is already wired up in `FeedItem`; this phase surfaces the full likes tab on the profile and the liked-posts listing.

## Goals / Non-Goals

**Goals:**
- Add `getLikedPosts` query to `@repo/api-client/features/likes`
- Add `/profile/[username]/likes` page that lists all posts a user has liked
- Add a Likes tab to the profile header that navigates to the likes page
- Reuse `FeedItem` for rendering liked posts (same shape: `FeedPost`)

**Non-Goals:**
- Like notifications — already implemented
- Infinite scroll — use the existing load-more cursor pattern
- Likes on replies — the likes spec applies to all posts; the likes page shows only top-level liked posts for simplicity (same as profile posts)
- Real-time like count updates

## Decisions

### getLikedPosts lives in the likes api-client, not the profile client

The profile client is already large and focused on profile/post queries. Liked posts are a distinct concern owned by the likes feature. The likes page can create its own client instance.

### Reuse FeedPost type for liked posts

`FeedPost` already has `likeCount`, `isLikedByViewer`, `author`, `replyCount` — the exact shape needed. Adding a new type would be redundant. `getLikedPosts` returns `FeedPage`.

### Liked posts page shows all post types (root + replies)

The user's liked posts include both root posts and replies. Unlike the profile posts tab (which hides replies), the likes tab should show everything the user liked, since that is the expected mental model. Each liked post is rendered with `FeedItem` as-is.

### Profile tabs use client-side navigation links, not a tab component

The profile page currently has no tab UI. The simplest approach is a tab bar of `<Link>` elements styled as active/inactive based on `usePathname()`. This avoids introducing a new tab abstraction for two tabs.

## Risks / Trade-offs

- `getLikedPosts` orders by `Like.createdAt` descending — this is the natural "most recently liked first" order. If Prisma schema doesn't expose `Like.createdAt` as a cursor, pagination uses the post `id` instead. **Mitigation**: use `Like.createdAt` + `Like.postId` as composite cursor, or fall back to `postId` cursor (simpler, acceptable for MVP).
- The profile tabs require a client component (`usePathname`) for active-state detection. Wrapping only the tab bar (not the whole profile page) keeps the rest server-rendered. **Mitigation**: extract a `ProfileTabs` client component; page and header remain server components.
- The likes page fetches liked posts for any username (public). No auth gate is needed in MVP since all profiles are public. **Mitigation**: document this assumption; revisit when auth is added.
