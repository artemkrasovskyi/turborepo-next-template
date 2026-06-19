## 1. Parser & Shared Types

- [ ] 1.1 Create `packages-types/src/features/social-text/index.ts` with `parseHashtags`, `parseMentions`, and `parseSocialText`
- [ ] 1.2 Add unit tests for parser boundaries, punctuation, duplicate casing, max token lengths, empty text, hashtags, and mentions
- [ ] 1.3 Add `"./features/social-text": "./src/features/social-text/index.ts"` to `packages-types/package.json` exports
- [ ] 1.4 Extend `NotificationType` in `packages-types/src/features/notifications/index.ts` with `MENTION`
- [ ] 1.5 Extend `FeedPost` in `packages-types/src/features/feed/index.ts` with `threadId: string`

## 2. Prisma Schema

- [ ] 2.1 Add `Hashtag` model with `id`, unique normalized `name`, `createdAt`, and `posts` relation
- [ ] 2.2 Add `PostHashtag` model with `postId`, `hashtagId`, `createdAt`, `@@id([postId, hashtagId])`, and `@@index([hashtagId, createdAt])`
- [ ] 2.3 Add `PostMention` model with `postId`, `mentionedUserId`, `createdAt`, `@@id([postId, mentionedUserId])`, and `@@index([mentionedUserId, createdAt])`
- [ ] 2.4 Add `hashtags PostHashtag[]` and `mentions PostMention[]` relations to `Post`
- [ ] 2.5 Add `mentionsReceived PostMention[]` relation to `User`
- [ ] 2.6 Add `MENTION` to the Prisma `NotificationType` enum
- [ ] 2.7 Add `@@unique([recipientId, actorId, type, postId])` to `Notification`
- [ ] 2.8 Run `bun run db:migrate` and `bun run db:generate`

## 3. Post Creation API

- [ ] 3.1 Update `packages/api-client/src/features/posts/index.ts` so `createPost` parses hashtags and mentions from the stored body
- [ ] 3.2 Wrap post creation, image creation, hashtag upserts, `PostHashtag` creation, user mention resolution, and `PostMention` creation in one transaction
- [ ] 3.3 Return `{ id, mentionedUserIds }` from `createPost`
- [ ] 3.4 Apply the same parsing, transaction, and return shape to `createReply`
- [ ] 3.5 Add API-client tests for hashtag creation, duplicate hashtags, resolved mentions, unknown mentions, and image + social-text creation in the same post

## 4. Mention Notifications

- [ ] 4.1 Add `notifyMention({ actorId, recipientId, postId })` to `packages/api-client/src/features/notifications/index.ts`
- [ ] 4.2 Make `notifyMention` no-op for self-mentions and idempotent for duplicate calls
- [ ] 4.3 Update `apps/main/src/features/post-composer/actions.ts` to call `notifyMention` for each returned mentioned user after `createPost`
- [ ] 4.4 Update `apps/main/src/features/post-thread/actions.ts` to call `notifyMention` for each returned mentioned user after `createReply`
- [ ] 4.5 Update `apps/main/src/features/post-composer/actions.test.ts` for the new `createPost` return shape, image argument, and mention notification calls
- [ ] 4.6 Update `apps/main/src/features/post-thread/actions.test.ts` for the new `createReply` return shape and mention notification calls

## 5. Notification UI

- [ ] 5.1 Update `packages/api-client/src/features/notifications/index.ts` mapping so `MENTION` notifications include actor and post data
- [ ] 5.2 Update `apps/main/src/features/notifications/components/notification-item.tsx` to render mention notification copy and link to the mentioned post thread
- [ ] 5.3 Add notification component tests or focused action tests covering mention notification display data

## 6. Hashtag API

- [ ] 6.1 Create `packages/api-client/src/features/hashtags/index.ts` with `createHashtagsClient()`
- [ ] 6.2 Implement `getHashtagFeed({ tag, viewerId, cursor, limit })`, normalizing `tag` and returning `FeedPage`
- [ ] 6.3 Include author, parent id, reply count, like count, repost count, viewer like/repost state, images, and repost attribution compatibility fields when mapping posts
- [ ] 6.4 Map `threadId` as `post.parentId ?? post.id` so reply results link to their parent thread
- [ ] 6.5 Add `"./features/hashtags": "./src/features/hashtags/index.ts"` to `packages/api-client/package.json` exports

## 7. Hashtag Page

- [ ] 7.1 Create `apps/main/src/app/hashtags/[tag]/page.tsx` with `dynamic = 'force-dynamic'`
- [ ] 7.2 Render a normalized hashtag heading, initial posts using `FeedItem`, and an empty state when no posts match
- [ ] 7.3 Create `apps/main/src/features/hashtags/actions.ts` with `loadMoreHashtagPostsAction(tag, cursor, viewerId?)`
- [ ] 7.4 Create `apps/main/src/features/hashtags/components/hashtag-posts-load-more-button.tsx` for pagination
- [ ] 7.5 Create `apps/main/src/app/hashtags/[tag]/loading.tsx` with skeletons matching feed-card density

## 8. Social Text Rendering

- [ ] 8.1 Create `apps/main/src/features/social-text/components/social-text.tsx` to render parsed text with hashtag and mention links
- [ ] 8.2 Update `apps/main/src/features/feed/components/feed-item.tsx` to use `SocialText`, link thread navigation through `post.threadId`, and remove any invalid nested anchor markup around post body text
- [ ] 8.3 Update `apps/main/src/features/post-thread/components/post-card.tsx` to use `SocialText`
- [ ] 8.4 Verify hashtag links navigate to `/hashtags/[tag]` and mention links navigate to `/profile/[username]`

## 9. Verification

- [ ] 9.1 Run `bun run typecheck`
- [ ] 9.2 Run `bun run lint`
- [ ] 9.3 Run parser and action tests
- [ ] 9.4 Manually verify creating a post with hashtags links each tag and shows the post on its hashtag page
- [ ] 9.5 Manually verify creating a reply with a mention creates one notification for the mentioned user
- [ ] 9.6 Manually verify self-mentions and repeated mentions in the same body do not create duplicate notifications
