1. Add `@@index([parentId, createdAt])` to the `Post` model and create a migration
2. Extend shared post types (`packages-types/src/features/posts`) with `PostAuthor`, `ThreadPost`, `ThreadPage`, `CreateReplyInput`
3. Extend the posts client (`packages/api-client/src/features/posts`) with `getThread()` and `createReply()`
4. Add `replyCount` to `FeedPost`/`FeedPage` types and the feed query (`_count.replies`)
5. Create `createReplyAction` server action with validation and revalidation
6. Create `PostCard` component for rendering the root post and replies
7. Create `ReplyComposer` component with character counter and pending/error states
8. Create the thread page (`apps/main/src/app/posts/[id]/page.tsx`) with not-found handling
9. Update `FeedItem` to link to the thread page and show the reply count
10. Update package exports (`packages-types`, `packages/api-client`) for the posts feature
