## 1. Types

- [x] 1.1 Add `replyCount: number` to `FeedPost` type in `packages-types/src/features/feed/index.ts`
- [x] 1.2 Add `ThreadPost`, `ThreadPage`, and `CreateReplyInput` types to `packages-types/src/features/posts/index.ts`
- [x] 1.3 Export `posts` feature from `packages-types/package.json` exports map

## 2. API Client — Posts

- [x] 2.1 Add `getThread({ postId, viewerId })` method to `createPostsClient()` in `packages/api-client/src/features/posts/index.ts` — fetches root post (top-level only) and its replies ordered by `createdAt asc`
- [x] 2.2 Add `createReply({ authorId, parentId, body })` method to `createPostsClient()`
- [x] 2.3 Export `posts` feature from `packages/api-client/package.json` exports map

## 3. API Client — Feed

- [x] 3.1 Add `replies: true` to `_count.select` in `getHomeFeed` query in `packages/api-client/src/features/feed/index.ts`
- [x] 3.2 Map `post._count.replies` to `replyCount` in the returned `FeedPost` items

## 4. Thread Page Feature

- [x] 4.1 Create `apps/main/src/features/post-thread/` directory with `components/`, `lib/`, and `actions.ts`
- [x] 4.2 Create `PostCard` component (`components/post-card.tsx`) — renders author avatar, display name, username, timestamp, body, and like button for a `ThreadPost`
- [x] 4.3 Create `ReplyComposer` component (`components/reply-composer.tsx`) — textarea, character counter, submit button; calls `createReplyAction`; shows inline error on failure
- [x] 4.4 Create `createReplyAction` server action (`actions.ts`) — validates body with `validatePostBody`, calls `postsClient.createReply`, revalidates `/posts/<parentId>`
- [x] 4.5 Add `formatRelativeTime` utility to `lib/format-relative-time.ts`

## 5. Thread Page Route

- [x] 5.1 Create `apps/main/src/app/posts/[id]/page.tsx` — Server Component that fetches viewer, calls `getThread`, renders root post, `ReplyComposer` (authenticated only), and replies list or empty state
- [x] 5.2 Create `apps/main/src/app/posts/[id]/loading.tsx` — skeleton with post card placeholder, composer placeholder, and two reply card placeholders

## 6. Feed — Reply Count and Deep Link

- [x] 6.1 Update `FeedItem` component (`apps/main/src/features/feed/components/feed-item.tsx`) to wrap post body in `<Link href="/posts/{post.id}">`
- [x] 6.2 Add reply count display to `FeedItem` as `<Link href="/posts/{post.id}">{post.replyCount} {replyCount === 1 ? 'reply' : 'replies'}</Link>`

## 7. Tests

- [x] 7.1 Add unit tests for `createReplyAction` in `apps/main/src/features/post-thread/actions.test.ts` — covers empty body, whitespace-only body, body over max length, and valid submission with trimming
