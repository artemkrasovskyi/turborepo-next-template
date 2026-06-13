1. Add a `Like` model (`userId`, `postId`, `createdAt`, `@@id([userId, postId])`, `@@index([postId])`) plus `User.likes` / `Post.likes` back-relations, and generate a migration (`bun run db:migrate --name add_like_model`)
2. Create shared likes types (`packages-types/src/features/likes`) — `ToggleLikeResult`
3. Create likes client (`packages/api-client/src/features/likes`) — `like()`/`unlike()`, idempotent via `upsert`/`deleteMany`
4. Add `likeCount` and `isLikedByViewer` to `FeedPost` and `ThreadPost` types
5. Extend `getHomeFeed` to include each post's like count and the viewer's like state
6. Extend `getThread` with an optional `viewerId` and like count/state for the root post and replies
7. Extend `getProfilePosts` with an optional `viewerId` and like count/state
8. Create `toggleLikeAction` server action
9. Create `LikeButton` component with optimistic toggle, error rollback, and a non-interactive display mode when `viewerId` is `null`
10. Update `FeedItem` to accept `viewerId`, move the reply-count out of the body link into a footer row, and render `LikeButton`; thread `viewerId` through `FeedList` and `LoadMoreButton`
11. Update `PostCard` to accept `viewerId` and render `LikeButton`; pass `viewerId` to `getThread` and to each `PostCard` from the thread page
12. Update `ProfilePosts` and `ProfileLoadMoreButton` to accept `viewerId` and pass it to `getProfilePosts` and `FeedItem`; pass `viewer?.id ?? null` from the profile page
13. Update package exports (`packages-types`, `packages/api-client`) for the likes feature
