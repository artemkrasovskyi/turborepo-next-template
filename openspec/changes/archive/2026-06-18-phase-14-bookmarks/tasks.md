## 1. Prisma Schema

- [x] 1.1 Add `Bookmark` model with `userId`, `postId`, `createdAt`, relations to `User` and `Post`, `@@id([userId, postId])`, `@@index([postId])`, and `@@index([userId, createdAt])`
- [x] 1.2 Add `bookmarks Bookmark[]` relations to `User` and `Post`
- [x] 1.3 Add migration SQL for the `Bookmark` model
- [x] 1.4 Run `bun run db:generate` to regenerate Prisma Client

## 2. Types

- [x] 2.1 Create `packages-types/src/features/bookmarks/index.ts` with `ToggleBookmarkResult`
- [x] 2.2 Add `"./features/bookmarks"` to `packages-types/package.json` exports
- [x] 2.3 Extend `FeedPost` with `isBookmarkedByViewer: boolean`
- [x] 2.4 Extend `ThreadPost` with `isBookmarkedByViewer: boolean`

## 3. API Client

- [x] 3.1 Create `packages/api-client/src/features/bookmarks/index.ts` with `createBookmarksClient()`
- [x] 3.2 Implement idempotent `bookmark({ userId, postId })`
- [x] 3.3 Implement `unbookmark({ userId, postId })`
- [x] 3.4 Implement `getBookmarkedPosts({ userId, viewerId, cursor, limit })` returning `FeedPage`
- [x] 3.5 Add `"./features/bookmarks"` to `packages/api-client/package.json` exports
- [x] 3.6 Update feed, profile, search, likes, and thread post mappings to include viewer bookmark state

## 4. App UI

- [x] 4.1 Create bookmark server actions for toggle and load-more
- [x] 4.2 Create optimistic `BookmarkButton`
- [x] 4.3 Add `BookmarkButton` to `FeedItem`
- [x] 4.4 Add `BookmarkButton` to `PostCard`
- [x] 4.5 Create private `/bookmarks` page with empty state and saved posts list
- [x] 4.6 Create bookmarks load-more component
- [x] 4.7 Add Bookmarks link to the main nav

## 5. Verification

- [x] 5.1 Run `bun run typecheck`
- [ ] 5.2 Run `bun run lint`
- [ ] 5.3 Manually verify saving and unsaving from the home feed
- [ ] 5.4 Manually verify saving and unsaving from a thread page
- [ ] 5.5 Manually verify `/bookmarks` shows saved posts and paginates
