## Context

Posts can currently be liked and reposted. Those interactions are public-facing: likes can be
listed from a profile tab, and reposts can appear in the home feed. There is no private way for a
viewer to save a post for later.

Phase 14 adds private bookmarks:
- a save/unsave action on post cards
- viewer-specific bookmark state in post query results
- a private `/bookmarks` page listing saved posts

## Goals / Non-Goals

**Goals:**
- Let signed-in users save and unsave posts idempotently
- Show saved state on feed cards and thread post cards
- Add a private bookmarks page at `/bookmarks`
- Reuse the existing `FeedPost`, `FeedItem`, and load-more pagination patterns
- Keep bookmarks private: no public counts, profile tab, feed attribution, or notifications

**Non-Goals:**
- Bookmark notifications
- Public bookmark counts
- Public profile bookmarks tab
- Bookmark folders, tags, or notes
- Real-time bookmark updates across browser tabs

## Decisions

### Bookmark model mirrors Like without counts

Bookmarks use a join model with a compound primary key:

```prisma
model Bookmark {
  userId    String
  postId    String
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id])
  post Post @relation(fields: [postId], references: [id])

  @@id([userId, postId])
  @@index([postId])
  @@index([userId, createdAt])
}
```

The compound key makes saving idempotent. The `userId, createdAt` index supports the private
bookmarks page ordered by most recently saved.

### Bookmarks are private viewer state

`FeedPost` gains `isBookmarkedByViewer: boolean`. `ThreadPost` gains the same field for thread
cards. There is no `bookmarkCount`; exposing counts would make a private interaction partially
public.

### API client owns bookmark queries

Add `createBookmarksClient()` with:

```ts
bookmark({ userId, postId }): Promise<{ created: boolean }>
unbookmark({ userId, postId }): Promise<void>
getBookmarkedPosts({ userId, viewerId, cursor, limit }): Promise<FeedPage>
```

`getBookmarkedPosts` returns `FeedPage` so the bookmarks page can reuse `FeedItem`. Results are
ordered by `Bookmark.createdAt desc` and use the bookmarked post id as the cursor, matching the
existing liked-posts page convention.

### UI mirrors LikeButton/RepostButton behavior

`BookmarkButton` is a client component with optimistic state and error revert. It appears beside
reply, repost, and like actions in feed cards, and beside the like action in thread cards.

For unauthenticated viewers, the button renders as inert state instead of attempting a mutation,
matching the existing like button behavior.

### `/bookmarks` is owner-only

The route reads the current viewer with `getViewerUser()`. If there is no viewer, it renders an
empty/auth state. If a viewer exists, it queries bookmarks for that viewer and renders saved posts
with load-more pagination.

## Risks / Trade-offs

- **Cursor uses post id**: pagination follows the existing liked-posts pattern. If a user bookmarks
  and unbookmarks rapidly around page boundaries, ordering can shift between requests. Acceptable
  for MVP.
- **No public affordance**: bookmarks are discoverable through the nav and post button, not profile
  tabs. This keeps privacy clear.
- **Extra viewer-state include**: feed-like queries add one small relation include for bookmarks.
  The query is bounded by existing page sizes.
