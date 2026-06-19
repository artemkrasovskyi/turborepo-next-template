## Context

No repost infrastructure exists today. The Prisma schema has `Like` (userId, postId, @@id) as the closest analogue. The home feed query fetches `Post` records authored by followed users, ordered by `Post.createdAt`, using an id-based cursor. `FeedPost` in `@repo/types` has no repost fields. Everything must be built from scratch.

## Goals / Non-Goals

**Goals:**
- Add `Repost` model to Prisma schema (migration required)
- Toggle repost / undo repost, idempotent, mirrors the Like pattern
- Display repost count and viewer repost state on every post card
- Show reposts from followed users in the home feed with a "X reposted" attribution banner
- Optimistic repost toggle with error revert

**Non-Goals:**
- Repost notifications (no `REPOST` notification type in Phase 11)
- Profile "Reposts" tab
- Quote reposts — plain reposts only
- Reposts in the thread page or profile posts list (feed only)

## Decisions

### Repost model mirrors Like

```prisma
model Repost {
  userId    String
  postId    String
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id])
  post Post @relation(fields: [postId], references: [id])

  @@id([userId, postId])
  @@index([postId])
}
```

Simple and consistent with the existing `Like` model. Idempotency is enforced by the compound primary key.

### Feed merging: two Prisma queries, in-memory sort

Prisma has no UNION support. The home feed fetches posts and reposts from followed users (plus the viewer's own) in two separate queries, merges them in memory, sorts by `feedTime` (= `Post.createdAt` for post items, `Repost.createdAt` for repost items), then slices to `pageSize + 1`.

### Cursor changes from id-based to timestamp-based

The current feed uses Prisma's cursor pagination on `Post.id`. With two heterogeneous tables, id-based cursor no longer works. The cursor becomes an ISO timestamp string representing the feedTime of the last item returned. The next page filters `createdAt < cursor` on both tables.

**Known limitation**: items with identical timestamps at a page boundary may be skipped. Acceptable for MVP — CUID generation makes exact collisions extremely rare in practice.

### FeedPost.createdAt is the feed position time

For repost feed items, `FeedPost.createdAt` is set to `Repost.createdAt` (when it was reposted), not the original post's creation time. This determines the item's position in the feed. The original author and post body are unchanged.

### Repost items reuse FeedPost with an optional repostedBy field

Rather than a new type, `FeedPost` gains three new fields:

```typescript
repostCount: number;
isRepostedByViewer: boolean;
repostedBy?: FeedAuthor;   // present only on repost feed items
```

`FeedItem` renders a "reposted by X" banner when `repostedBy` is present. All other rendering (author, body, counts) is unchanged.

### Deduplication: keep the most recent occurrence

If a post appears both directly (authored by a followed user) and as a repost (reposted by another followed user), the merged list may contain duplicates by post id. Deduplication keeps the entry with the latest feedTime, so the post appears once at the most prominent position.

### RepostButton mirrors LikeButton exactly

Client component with `useState` for local `isReposted` and `repostCount`, `useTransition` for the server action, immediate optimistic update, revert on error.

## Risks / Trade-offs

- **Timestamp cursor gaps**: items at the exact cursor boundary can be skipped. → Acceptable for MVP; document and revisit if reported.
- **In-memory merge cost**: for users following thousands of accounts with many reposts, merging `2 × (pageSize + 1)` rows in memory is negligible. The real cost is two DB round trips; a raw SQL UNION could eliminate one at the expense of losing Prisma type safety.
- **Duplicate suppression**: dedup runs after sorting, adding O(n) but n is at most `2 × (pageSize + 1)` = 42 rows.
- **Viewer's own reposts in their own feed**: included (consistent with own posts being visible). Can be excluded later if product decides otherwise.
