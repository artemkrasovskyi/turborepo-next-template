## Context

Posts currently store plain body text plus optional images. The feed, thread page, profile posts,
and trending posts render `post.body` as unlinked text, and there is no stored relationship between
a post and any hashtags or mentioned users contained in that body.

Notifications currently support `FOLLOW` and `LIKE`. Mention notifications require a new
notification type and a reliable way to resolve `@username` tokens during post and reply creation.

This phase adds lightweight social text entities:
- hashtags parsed from post and reply bodies
- a hashtag page at `/hashtags/[tag]`
- user mentions parsed from post and reply bodies
- mention notifications for newly created posts and replies

## Goals / Non-Goals

**Goals:**
- Parse hashtags and mentions from post and reply body text at creation time
- Store normalized hashtag relationships so a hashtag page can query matching posts efficiently
- Store mentioned-user relationships for auditability and future profile surfaces
- Render hashtags and mentions in post bodies as links
- Add `/hashtags/[tag]` page with paginated posts for a tag
- Create mention notifications for mentioned users when a post or reply is created
- Avoid self-mention notifications and duplicate notifications for repeated mentions in one body

**Non-Goals:**
- Hashtag autocomplete or mention autocomplete in the composer
- Trending hashtags
- Full-text search changes
- Editing post bodies and recalculating hashtag / mention relationships
- Notifications for mentions inside reposts
- Case-sensitive hashtags; tags are normalized to lowercase

## Decisions

### Shared parser lives in `@repo/types`

Parsing rules should be shared by Server Actions, API client code, and UI rendering. Add a small
utility module at `packages-types/src/features/social-text/index.ts` with:

```ts
export function parseHashtags(body: string): string[];
export function parseMentions(body: string): string[];
export function parseSocialText(body: string): { hashtags: string[]; mentions: string[] };
```

Rules:
- Hashtags match `#` followed by 1-50 letters, numbers, or underscores
- Mentions match `@` followed by 1-30 letters, numbers, or underscores
- Tokens must start at the beginning of the string or after a non-word character
- Trailing punctuation is excluded by the token pattern
- Results are deduplicated case-insensitively while preserving normalized lowercase values

This keeps parsing deterministic and easy to unit test without coupling it to Prisma.

### Hashtags use normalized storage

Add `Hashtag` and `PostHashtag` models:

```prisma
model Hashtag {
  id        String   @id @default(cuid())
  name      String   @unique
  createdAt DateTime @default(now())

  posts PostHashtag[]
}

model PostHashtag {
  postId    String
  hashtagId String
  createdAt DateTime @default(now())

  post    Post    @relation(fields: [postId], references: [id], onDelete: Cascade)
  hashtag Hashtag @relation(fields: [hashtagId], references: [id])

  @@id([postId, hashtagId])
  @@index([hashtagId, createdAt])
}
```

The stored `Hashtag.name` is lowercase and does not include `#`. Display can reconstruct `#name`.
`PostHashtag.createdAt` lets hashtag pages paginate by the relationship creation time, which is
effectively the post creation time for MVP.

### Mentions store resolved users only

Add `PostMention` for mentions that match an existing user:

```prisma
model PostMention {
  postId          String
  mentionedUserId String
  createdAt       DateTime @default(now())

  post          Post @relation(fields: [postId], references: [id], onDelete: Cascade)
  mentionedUser User @relation(fields: [mentionedUserId], references: [id])

  @@id([postId, mentionedUserId])
  @@index([mentionedUserId, createdAt])
}
```

Unknown `@username` tokens render as plain text and create no `PostMention` row. This avoids
notifications to nonexistent users and keeps username changes out of scope.

### Post creation owns relationship writes

`createPostsClient().createPost()` and `createReply()` should parse the final trimmed body inside
the API client, create the `Post`, then create related hashtag and mention rows in the same
transaction.

The transaction flow:
1. Create the `Post`.
2. Create image rows when provided.
3. Upsert each hashtag by normalized name.
4. Create `PostHashtag` rows with `skipDuplicates`.
5. Resolve mentioned users by normalized username.
6. Create `PostMention` rows with `skipDuplicates`.
7. Return the post id and the resolved mentioned user ids.

Returning mentioned user ids lets Server Actions create notifications without reparsing or
requerying the body.

### Mention notifications are triggered from Server Actions

Add `MENTION` to `NotificationType` and `notifyMention({ actorId, postId, recipientId })` to the
notifications client. The method should no-op when `recipientId === actorId`.

`createPostAction()` and `createReplyAction()` call `notifyMention()` for each resolved mentioned
user after successful post creation. Notification creation can happen after the post transaction;
if one notification insert fails, the post itself should not be rolled back.

### Notification uniqueness for mentions

A post body may mention the same user multiple times with different casing. Parser deduplication
and the `PostMention` compound key prevent duplicate relationships. Notification creation should
receive deduped user ids and create at most one `MENTION` notification per recipient per post.

Add a Prisma uniqueness constraint for notifications that have a post target:

```prisma
@@unique([recipientId, actorId, type, postId])
```

This also makes future repeated notification calls idempotent. Because `postId` is nullable,
database-specific null behavior does not enforce uniqueness for follow notifications; existing
follow idempotency continues to be handled by the follow action.

### Rendering social text

Create `SocialText` under `apps/main/src/features/social-text/components/social-text.tsx`. It
tokenizes text with the shared parser rules and renders:
- hashtags as links to `/hashtags/<normalized-tag>`
- mentions as links to `/profile/<normalized-username>`
- all other text as plain text

Use it in `FeedItem` and `PostCard` instead of rendering `post.body` directly. Links are rendered
inside the existing clickable post area only if the surrounding component no longer wraps the whole
body in a single post link; nested anchors are invalid HTML. The safer change is to make the body
container plain text and rely on the reply-count / card affordances for thread navigation, or add a
separate timestamp/body wrapper that does not contain social links.

### Hashtag page mirrors feed pagination

Add `createHashtagsClient()` with:

```ts
async getHashtagFeed({ tag, viewerId, cursor, limit }: GetHashtagFeedParams): Promise<FeedPage>
```

The client normalizes `tag`, finds the `Hashtag`, then queries `PostHashtag` rows ordered by
`createdAt desc, postId desc`, including the related post with the same counts and viewer state used
by feed cards.

Because replies are also `Post` records, hashtag results need a stable thread destination. Extend
`FeedPost` with `threadId: string` and map it as `post.parentId ?? post.id`. Existing home-feed
items have `threadId === id`; reply results on hashtag pages link to their parent thread.

The route is `/hashtags/[tag]`. It renders a heading like `#react`, an empty state when the tag has
no posts, and a load-more button using a new server action.

## Risks / Trade-offs

- **Regex false positives**: simple token parsing may link emails or unusual punctuation incorrectly.
  The boundary rule avoids common cases like `email@domain.com`, which is enough for MVP.
- **Username changes**: stored mentions point to user ids, while rendered `@username` links are based
  on body text. If usernames become editable later, old text may link to stale usernames. Acceptable
  because username editing is not part of this phase.
- **Nested link refactor**: linking hashtags and mentions inside body text conflicts with current
  body-as-thread-link rendering. This phase should explicitly update feed and thread markup to avoid
  nested anchors.
- **Notification fan-out**: posts can mention many users, but max body length is 280 characters, so
  fan-out remains bounded.
