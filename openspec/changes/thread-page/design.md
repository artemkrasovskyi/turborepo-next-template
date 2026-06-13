## Context

The `feed` capability explicitly excludes replies from the home feed. `post-composer` lets the viewer create top-level posts but lists "Reply composition — requires a post-detail/thread view, which doesn't exist yet" as a Non-Goal/future capability. This design is that future capability: a thread page that shows a post and its replies, and lets the viewer reply to it.

Existing conventions to follow (`openspec/specs/architecture/spec.md`, `feed`, `post-composer`):

- Feature-first layout under `src/features/<name>/`
- `@repo/api-client` calls Prisma directly via `createXClient()` factories (see `createFeedClient`, and the `createPostsClient` introduced by `post-composer`)
- Shared types/constants live in `@repo/types/features/<name>`, exported via package.json `exports`
- Server Actions (`'use server'`) wrap api-client calls for mutations (no HTTP layer)
- `viewerId` is resolved via `createUsersClient().getViewerUser()` until `user-auth` lands
- `MAX_POST_LENGTH` (280, from `post-composer`) governs both posts and replies
- Tailwind for styling, matching `FeedItem`'s card style and `LoadMoreButton`'s `useState` + `useTransition` pending/error pattern

This design depends on `post-composer` having landed (`packages-types/src/features/posts` with `MAX_POST_LENGTH`/`CreatePostInput`, and `packages/api-client/src/features/posts` with `createPostsClient().createPost()`), and extends both.

## Goals / Non-Goals

**Goals:**

- Render a thread page at `/posts/[id]` showing a top-level post (the "root post") followed by its replies, ordered oldest first
- Let the viewer compose and submit a reply to the root post from its thread page
- Persist replies via Prisma (`Post.parentId = <root id>`, `Post.authorId = viewerId`)
- Link feed items to their thread page and show each post's reply count in the feed

**Non-Goals:**

- Nested/threaded replies (replies to replies) — the domain model states nested replies are not required for MVP; the reply composer always targets the root post, keeping the post tree exactly two levels deep
- Pagination of replies — out of scope for MVP; revisit if reply counts grow
- Likes, notifications — separate capabilities, not built here
- Editing or deleting posts/replies — domain model states posts are immutable in MVP
- Rich text, mentions, hashtags, media/image attachments
- Optimistic client-side insertion of new replies (rely on server-side revalidation, consistent with `post-composer`)
- Authentication — continues to use `getViewerUser()`

## Requirements

### Requirement: Thread View

The system SHALL render a page for a top-level post showing that post (the "root post") followed by all of its replies, ordered by `createdAt` ascending (oldest first).

#### Scenario: Viewer opens a thread with replies

- **WHEN** a viewer navigates to a top-level post's thread page
- **THEN** the system SHALL display the root post followed by its replies, ordered from oldest to newest

#### Scenario: Viewer opens a thread with no replies

- **WHEN** a viewer navigates to a top-level post that has no replies
- **THEN** the system SHALL display the root post and indicate that there are no replies yet

#### Scenario: Viewer opens a thread for a non-existent post

- **WHEN** a viewer navigates to `/posts/<id>` for an id that does not correspond to an existing top-level post
- **THEN** the system SHALL display a not-found state

### Requirement: Reply Composition

The system SHALL let the viewer compose and submit a reply to the root post from its thread page, applying the same validation as top-level post composition (non-empty, within `MAX_POST_LENGTH`).

#### Scenario: Viewer submits a valid reply

- **WHEN** the viewer submits non-empty reply text within the maximum length
- **THEN** the system SHALL persist a new `Post` with `authorId` set to the viewer, `parentId` set to the root post's id, and `createdAt` set to the current time

#### Scenario: Viewer submits empty or whitespace-only text

- **WHEN** the viewer submits reply text that is empty or contains only whitespace
- **THEN** the system SHALL NOT create a reply and SHALL indicate that the reply cannot be empty

#### Scenario: Viewer submits text exceeding the maximum length

- **WHEN** the viewer submits reply text longer than the maximum post length
- **THEN** the system SHALL NOT create a reply and SHALL indicate that the maximum length has been exceeded

#### Scenario: Reply submission succeeds

- **WHEN** the viewer successfully submits a reply
- **THEN** the thread page SHALL refresh and display the new reply at the end of the replies list without a full page reload

### Requirement: Feed Links to Threads

The system SHALL let the viewer navigate from a feed post to that post's thread page, and SHALL display the post's reply count in the feed.

#### Scenario: Feed item shows reply count

- **WHEN** the home feed renders a post
- **THEN** the feed item SHALL display the number of replies that post has

#### Scenario: Viewer opens a thread from the feed

- **WHEN** the viewer activates a feed item
- **THEN** the system SHALL navigate to that post's thread page at `/posts/<id>`

## Decisions

### 1. Thread scope: root + direct replies only (flat, single level)

A thread page always treats its `[id]` as a top-level post (`parentId: null`) — the only kind of post the feed links to. Replies are posts with `parentId` equal to that id. The reply composer always creates `Post { parentId: <root id> }`, so replies never themselves receive replies — matching "nested replies are not required for MVP" and keeping the post tree exactly two levels deep. `_count.replies` on a root post therefore equals its total reply count.

### 2. Schema: add an index for reply lookups

No new models or fields — `Post.parentId` already models replies. Add an index to support the replies query (`where: { parentId }, orderBy: createdAt`) and the `_count` used for feed reply counts:

```prisma
model Post {
  ...
  @@index([authorId, createdAt])
  @@index([parentId, createdAt])
}
```

Requires a migration (`bun run db:migrate`).

### 3. Shared types — `packages-types/src/features/posts/index.ts`

Extends the file introduced by `post-composer` (`MAX_POST_LENGTH`, `CreatePostInput`):

```ts
export type PostAuthor = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
};

export type ThreadPost = {
  id: string;
  body: string;
  createdAt: string;
  author: PostAuthor;
};

export type ThreadPage = {
  root: ThreadPost;
  replies: ThreadPost[];
};

export type CreateReplyInput = {
  authorId: string;
  parentId: string;
  body: string;
};
```

`PostAuthor` deliberately duplicates `FeedAuthor`'s shape — `posts` and `feed` stay independent, per "Shared types live in `@repo/types/features/<name>`".

### 4. Posts client — `packages/api-client/src/features/posts/index.ts`

Extends the `createPostsClient()` introduced by `post-composer`:

```ts
export function createPostsClient() {
  return {
    async createPost({ authorId, body }: CreatePostInput): Promise<{ id: string }> {
      // from post-composer
    },

    async getThread({ postId }: { postId: string }): Promise<ThreadPage | null> {
      const authorSelect = {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
      } as const;

      const root = await prisma.post.findFirst({
        where: { id: postId, parentId: null },
        include: { author: { select: authorSelect } },
      });

      if (!root) {
        return null;
      }

      const replies = await prisma.post.findMany({
        where: { parentId: postId },
        orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
        include: { author: { select: authorSelect } },
      });

      const toThreadPost = (post: typeof root): ThreadPost => ({
        id: post.id,
        body: post.body,
        createdAt: post.createdAt.toISOString(),
        author: post.author,
      });

      return { root: toThreadPost(root), replies: replies.map(toThreadPost) };
    },

    async createReply({ authorId, parentId, body }: CreateReplyInput): Promise<{ id: string }> {
      return prisma.post.create({
        data: { authorId, parentId, body },
        select: { id: true },
      });
    },
  };
}
```

`getThread` returns `null` for a missing or non-top-level post id, which the page maps to `notFound()`.

### 5. Feed reply counts — `packages/api-client/src/features/feed/index.ts`

Add `_count: { select: { replies: true } }` to the existing feed query's `include`, and map it to `replyCount` in each `FeedPage` item. `FeedPost` (`packages-types/src/features/feed/index.ts`) gains `replyCount: number`.

### 6. Reply server action — `apps/main/src/features/post-thread/actions.ts`

Mirrors `post-composer`'s `createPostAction`:

```ts
'use server';

import { revalidatePath } from 'next/cache';
import { createPostsClient } from '@repo/api-client/features/posts';
import { MAX_POST_LENGTH } from '@repo/types/features/posts';

const postsClient = createPostsClient();

export type CreateReplyResult =
  | { id: string; error?: undefined }
  | { id?: undefined; error: string };

export async function createReplyAction(
  authorId: string,
  parentId: string,
  body: string,
): Promise<CreateReplyResult> {
  const trimmed = body.trim();

  if (trimmed.length === 0) {
    return { error: 'Reply cannot be empty.' };
  }

  if (trimmed.length > MAX_POST_LENGTH) {
    return { error: `Reply must be ${MAX_POST_LENGTH} characters or fewer.` };
  }

  const reply = await postsClient.createReply({ authorId, parentId, body: trimmed });
  revalidatePath(`/posts/${parentId}`);
  return { id: reply.id };
}
```

### 7. Thread page — `apps/main/src/app/posts/[id]/page.tsx`

Server component, `force-dynamic` like the home page:

```tsx
export const dynamic = 'force-dynamic';

export default async function ThreadPage({ params }: { params: { id: string } }) {
  const [viewer, thread] = await Promise.all([
    usersClient.getViewerUser(),
    postsClient.getThread({ postId: params.id }),
  ]);

  if (!thread) {
    notFound();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-4 px-6 py-12">
      <PostCard post={thread.root} />
      {viewer ? <ReplyComposer authorId={viewer.id} parentId={thread.root.id} /> : null}
      {thread.replies.length === 0 ? (
        <p className="text-sm text-slate-600">No replies yet.</p>
      ) : (
        thread.replies.map((reply) => <PostCard key={reply.id} post={reply} />)
      )}
    </main>
  );
}
```

### 8. UI components — `apps/main/src/features/post-thread/components/`

- `post-card.tsx` — renders one `ThreadPost` (root or reply), styled like `FeedItem` (`rounded-lg border border-slate-200 bg-white p-5 shadow-sm`, initials avatar, relative timestamp)
- `reply-composer.tsx` — client component mirroring `post-composer`'s `PostComposer` (character counter, `useState` + `useTransition` pending/error states), calling `createReplyAction(authorId, parentId, body)`; on success, clears the textarea and lets the revalidated page show the new reply

`formatRelativeTime` (currently `apps/main/src/features/feed/lib/format-relative-time.ts`) is duplicated into `apps/main/src/features/post-thread/lib/format-relative-time.ts` to keep the two features independent (see Risks).

### 9. Feed item updates — `apps/main/src/features/feed/components/feed-item.tsx`

Wrap the card in a `<Link href={`/posts/${post.id}`}>` and render the reply count next to the timestamp, e.g. `{post.replyCount} {post.replyCount === 1 ? 'reply' : 'replies'}`.

## Risks / Trade-offs

- [Risk] `post-card.tsx` and `formatRelativeTime` duplicate logic already in `feed` → Mitigation: acceptable at this scale (two small features, ~15 lines each); extract a shared module under `packages/` if a third consumer appears
- [Risk] `_count.replies` adds a subquery to every feed item → Mitigation: Prisma compiles `_count` into a single aggregated query; negligible at page size ≤ 20
- [Risk] No pagination for replies — a heavily-replied post loads all replies at once → Mitigation: acceptable for MVP/demo data; Decision 1 keeps replies flat, so the feed's keyset pattern applies directly if pagination is needed later
- [Risk] Wrapping `FeedItem` in a `<Link>` may complicate adding interactive controls (e.g. a future like button) inside the card → Mitigation: not an issue today — `FeedItem` has no interactive elements

## Open Questions

- Reply pagination threshold — out of scope for MVP; revisit if seeded/demo data produces threads with many replies
