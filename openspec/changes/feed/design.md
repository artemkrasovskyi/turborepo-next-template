## Context

The Prisma schema currently only contains a `Note` model (template leftover). Implementing the home feed requires the foundational `User`, `Post`, and `Follow` models described in `openspec/specs/domain-model/spec.md`. No other capability (`user-auth`, `post`, `follow`, `like`) has landed yet, so this design also establishes the shared data model that those capabilities will extend later.

Existing conventions to follow (`openspec/specs/architecture/spec.md`):

- Feature-first layout under `src/features/<name>/`
- `@repo/api-client` calls Prisma directly via a `createXClient()` factory (see `packages/api-client/src/features/notes`)
- Single Prisma singleton from `@repo/shared/features/database`
- Shared types live in `@repo/types/features/<name>`

## Goals / Non-Goals

**Goals:**

- Add the minimal `User`, `Post`, and `Follow` Prisma models needed to compute a home feed
- Define a cursor-paginated, chronological feed query (followed users + viewer's own top-level posts, replies excluded)
- Expose the feed via `createFeedClient().getHomeFeed()` in `@repo/api-client`, with shared types in `@repo/types`
- Render the feed as the home page (`apps/main`) with a server-rendered first page and a "load more" action for subsequent pages

**Non-Goals:**

- Authentication / session management (`user-auth` capability) — this design takes `viewerId` as an explicit input
- Composing posts, replies, likes, notifications — separate capabilities, not built here
- Algorithmic ranking or real-time (websocket/polling) feed updates — explicitly excluded by the feed spec

## Requirements

### Requirement: Feed Composition

The system SHALL populate a user's home feed with top-level posts authored by users the viewer follows, plus the viewer's own top-level posts. Replies SHALL NOT appear in the home feed. The feed SHALL NOT contain sponsored or promoted content.

#### Scenario: Feed includes followed users' posts

- **WHEN** a user views their home feed
- **THEN** the feed SHALL include top-level posts authored by every user the viewer follows

#### Scenario: Feed includes the viewer's own posts

- **WHEN** a user views their home feed
- **THEN** the feed SHALL include the viewer's own top-level posts

#### Scenario: Replies are excluded from the home feed

- **WHEN** a followed user publishes a reply to another post
- **THEN** that reply SHALL NOT appear in the viewer's home feed

### Requirement: Chronological Ordering

The system SHALL order feed posts by creation time, most recent first, without applying any algorithmic ranking.

#### Scenario: Posts ordered by recency

- **WHEN** the feed contains posts from multiple authors
- **THEN** posts SHALL be ordered by `createdAt` descending

#### Scenario: No ranking applied

- **WHEN** the feed is generated
- **THEN** the system SHALL NOT reorder posts based on engagement, relevance, or any ranking signal

### Requirement: Feed Pagination

The system SHALL paginate the feed using cursor-based pagination so clients can load additional posts incrementally.

#### Scenario: Initial page load

- **WHEN** a user opens their home feed
- **THEN** the system SHALL return the most recent page of posts up to a fixed page size

#### Scenario: Loading the next page

- **WHEN** a user requests more posts using the cursor returned by the previous page
- **THEN** the system SHALL return the next page of posts older than that cursor

#### Scenario: End of feed reached

- **WHEN** no further posts exist beyond the current page
- **THEN** the system SHALL indicate that there are no more posts to load

### Requirement: Empty Feed State

The system SHALL handle the case where a user follows no one and has not posted.

#### Scenario: New user with no follows and no posts

- **WHEN** a user who follows no one and has not posted views their home feed
- **THEN** the system SHALL return an empty feed and the UI SHALL display guidance to follow other users

## Decisions

### 1. Shared schema additions

Add to `prisma/schema.prisma`:

```prisma
model User {
  id          String   @id @default(cuid())
  username    String   @unique
  displayName String
  bio         String?
  avatarUrl   String?
  createdAt   DateTime @default(now())

  posts     Post[]
  following Follow[] @relation("Follower")
  followers Follow[] @relation("Following")
}

model Post {
  id        String   @id @default(cuid())
  authorId  String
  body      String
  parentId  String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  author  User    @relation(fields: [authorId], references: [id])
  parent  Post?   @relation("PostReplies", fields: [parentId], references: [id])
  replies Post[]  @relation("PostReplies")

  @@index([authorId, createdAt])
}

model Follow {
  followerId  String
  followingId String
  createdAt   DateTime @default(now())

  follower  User @relation("Follower", fields: [followerId], references: [id])
  following User @relation("Following", fields: [followingId], references: [id])

  @@id([followerId, followingId])
}
```

A top-level post has `parentId == null`; replies (out of scope here) set `parentId` to the parent post's id. The `[authorId, createdAt]` index supports the feed's keyset query.

### 2. Feed query — keyset (cursor) pagination

Use the standard Prisma keyset pattern instead of `skip`-based offset pagination, ordering by `createdAt desc, id desc` to keep ordering stable when timestamps collide:

```ts
prisma.post.findMany({
  where: {
    parentId: null,
    authorId: { in: [...followedIds, viewerId] },
  },
  orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
  take: limit + 1,
  ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  include: { author: { select: { id: true, username: true, displayName: true, avatarUrl: true } } },
});
```

Fetch `limit + 1` rows; if the extra row exists, set `nextCursor` to the `limit`-th row's `id` and drop the extra row, otherwise `nextCursor` is `null`.

### 3. API surface

- `packages-types/src/features/feed/index.ts`: `FeedAuthor`, `FeedPost`, `FeedPage` (`{ items: FeedPost[]; nextCursor: string | null }`)
- `packages/api-client/src/features/feed/index.ts`: `createFeedClient()` returning `getHomeFeed({ viewerId, cursor?, limit? })`, following the `createNotesClient()` factory pattern — fetches `followingIds` via `prisma.follow.findMany({ where: { followerId: viewerId } })`, then runs the query from Decision 2

### 4. UI composition (`apps/main`)

- `src/features/feed/components/feed-list.tsx` — server component, calls `createFeedClient().getHomeFeed({ viewerId })` for the first page
- `src/features/feed/components/feed-item.tsx` — renders one post (author, body, relative timestamp)
- `src/features/feed/components/load-more-button.tsx` — client component invoking a server action for subsequent pages
- `src/features/feed/actions.ts` — `'use server'` action wrapping `createFeedClient().getHomeFeed()`, since Prisma must stay server-side (no HTTP layer)
- `src/app/page.tsx` becomes the home feed, replacing the current dashboard placeholder

## Risks / Trade-offs

- [Risk] `User`/`Post`/`Follow` are foundational models shared by future capabilities → Mitigation: keep this schema minimal (only fields the feed needs); other capabilities (`post`, `follow`, `like`) extend the same models additively in their own changes
- [Risk] Feed needs a `viewerId` but `user-auth` doesn't exist yet → Mitigation: `getHomeFeed` takes `viewerId` as an explicit parameter; the home page resolves it from the session once `user-auth` lands, decoupling feed logic from auth
- [Risk] Cursor pagination ties on identical `createdAt` values → Mitigation: secondary sort + cursor on `id` (Decision 2)
- [Risk] N+1 queries fetching author info per post → Mitigation: `include` author in the single feed query (Decision 2)

## Open Questions

- Default/maximum page size (proposing 20)
- Should `apps/main`'s `/` route require a signed-in viewer immediately, or support a logged-out/empty state until `user-auth` ships?
