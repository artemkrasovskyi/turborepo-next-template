## 1. Prisma Schema

- [x] 1.1 Add `Repost` model to `prisma/schema.prisma` — fields: `userId`, `postId`, `createdAt @default(now())`, relations to `User` and `Post`, `@@id([userId, postId])`, `@@index([postId])`
- [x] 1.2 Add `reposts` back-relation to the `Post` model and `reposts` back-relation to the `User` model in `schema.prisma`
- [x] 1.3 Run `bun run db:migrate` to create the migration
- [x] 1.4 Run `bun run db:generate` to regenerate Prisma Client

## 2. Types

- [x] 2.1 Extend `FeedPost` in `packages-types/src/features/feed/index.ts` with `repostCount: number`, `isRepostedByViewer: boolean`, and `repostedBy?: FeedAuthor`
- [x] 2.2 Create `packages-types/src/features/reposts/index.ts` — export `ToggleRepostResult` (mirrors `ToggleLikeResult`)
- [x] 2.3 Add `"./features/reposts": "./src/features/reposts/index.ts"` to `packages-types/package.json` exports

## 3. API Client

- [x] 3.1 Create `packages/api-client/src/features/reposts/index.ts` — export `createRepostsClient()` with `repost({ userId, postId })` (idempotent upsert returning `{ created: boolean }`) and `unrepost({ userId, postId })` (deleteMany, no error if missing)
- [x] 3.2 Add `"./features/reposts": "./src/features/reposts/index.ts"` to `packages/api-client/package.json` exports
- [x] 3.3 Update `packages/api-client/src/features/feed/index.ts` — change cursor from id-based to ISO timestamp; fetch posts AND reposts from followed users + viewer in two queries; include `_count.reposts` and `reposts (where: { userId: viewerId })` on each post; merge and sort by feedTime desc; deduplicate by post id keeping latest feedTime; map repost items with `createdAt = repost.createdAt` and `repostedBy` set; set `nextCursor` to last item's feedTime ISO string

## 4. App — Repost Actions & Components

- [x] 4.1 Create `apps/main/src/features/reposts/actions.ts` — `'use server'`; export `toggleRepostAction(userId, postId, nextIsReposted): Promise<ToggleRepostResult>` calling `repostsClient.repost` or `unrepost`
- [x] 4.2 Create `apps/main/src/features/reposts/components/repost-button.tsx` — `'use client'`; mirrors `LikeButton` with `isReposted` / `repostCount` local state, optimistic update, error revert, unauthenticated display (static count, no button)

## 5. Feed UI

- [x] 5.1 Update `apps/main/src/features/feed/components/feed-item.tsx` — add `RepostButton` next to `LikeButton` in the actions row, passing `viewerId`, `postId`, `initialIsReposted`, `initialRepostCount`
- [x] 5.2 Update `feed-item.tsx` — render a "↻ X reposted" attribution line above the author block when `post.repostedBy` is present, linking to `/profile/${post.repostedBy.username}`

## 6. Verification

- [x] 6.1 Run `bun run typecheck` — no errors
- [x] 6.2 Run `bun run lint` — no errors
- [x] 6.3 Manually verify: repost a post, confirm repost count increments and button reflects reposted state
- [x] 6.4 Manually verify: undo repost, confirm count decrements and state reverts
- [x] 6.5 Manually verify: repost made by a followed user appears in the home feed with "↻ X reposted" banner
- [x] 6.6 Manually verify: if the same post is authored by a followed user AND reposted by another, it appears once (deduplication)
